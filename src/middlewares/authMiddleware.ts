/**
 * ============================================================
 * middlewares/authMiddleware.ts – Middleware Bảo vệ Route Backend
 * ============================================================
 *
 * File này định nghĩa middleware `protectedRoute` – "người gác cổng" phía backend.
 *
 * Cách dùng trong routes:
 *   router.get("/sessions", protectedRoute, getSessions);
 *   // protectedRoute chạy TRƯỚC getSessions
 *   // Nếu pass → getSessions được gọi
 *   // Nếu fail → trả về 401, getSessions KHÔNG được gọi
 *
 * Tại sao backend cần bảo vệ riêng dù frontend đã có ProtectedRoute?
 *  → Frontend ProtectedRoute chỉ bảo vệ UI (có thể bị bypass bằng cách gọi API trực tiếp)
 *  → Backend middleware bảo vệ dữ liệu thật sự (không thể bypass dù dùng Postman, curl...)
 *  → Bảo vệ 2 lớp = Defense in Depth (nguyên tắc bảo mật)
 *
 * Chiến lược của middleware này (thông minh hơn middleware thông thường):
 *  → Thay vì CHỈ kiểm tra access token, nó còn tự động thử dùng refresh token
 *  → Nghĩa là: Access token hết hạn → không cần client phải gọi /refresh trước
 *  → Backend TỰ tạo access token mới và gắn vào header response (x-access-token)
 *  → Axios interceptor phía frontend sẽ bắt header này và lưu vào localStorage
 *
 * Luồng tổng quát:
 *  Có Authorization header?
 *   ├─ Có → jwt.verify()
 *   │   ├─ Valid   → req.user = decoded → next() ✅
 *   │   ├─ Expired → continueWithRefreshToken()
 *   │   └─ Invalid → 401 ❌
 *   └─ Không → continueWithRefreshToken()
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

/**
 * Hàm tạo Access Token mới.
 * Luôn hết hạn sau 15 phút để giới hạn thời gian tấn công nếu token bị đánh cắp.
 *
 * Payload gồm: id (để biết user nào), email, role (để phân quyền)
 * Ký bằng JWT_SECRET → Backend có thể verify tính toàn vẹn
 *
 * @param id - ID của user trong DB
 * @param email - Email của user
 * @param role - Role của user ("USER" | "ADMIN")
 */
const createAccessToken = (id: number, email: string, role: string) =>
  jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "15m" } as SignOptions);

/**
 * Hàm xử lý khi Access Token không hợp lệ/hết hạn.
 * Thay vì trả 401 ngay, thử dùng Refresh Token trong Cookie để cấp Access Token mới.
 *
 * Tại sao refresh ngay tại middleware thay vì bắt client gọi /auth/refresh?
 *  → Giảm round-trip: Client không phải biết token đã hết hạn, middleware lo hết
 *  → UX tốt hơn: Request thành công lần đầu thay vì fail → retry
 *  → Đặc biệt hữu ích cho các request xảy ra ngay khi token vừa expire
 *
 * Cơ chế giao tiếp token mới với client:
 *  → Gắn vào header: res.setHeader("x-access-token", newAccessToken)
 *  → Axios response interceptor đọc header này: response.headers["x-access-token"]
 *  → Lưu vào localStorage để request tiếp theo dùng
 *  → CORS cần expose header này: exposedHeaders: ["x-access-token"] trong app.ts
 */
const continueWithRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Đọc refresh token từ HttpOnly Cookie
  // Browser tự gửi Cookie kèm request nhờ credentials: true trong axios + cors
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (!refreshToken) {
    // Không có Cookie chứa refresh token → phiên hết hạn thật sự
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }

  try {
    /**
     * BƯỚC 1: Verify JWT của refresh token.
     * Dùng REFRESH_SECRET khác với JWT_SECRET để:
     *  → Tách biệt 2 loại token, không lẫn lộn
     *  → Nếu một secret bị lộ, chỉ ảnh hưởng một loại token
     */
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { id: number };

    /**
     * BƯỚC 2: Kiểm tra refresh token trong Database.
     * Tại sao cần kiểm tra DB dù JWT đã verify OK?
     *  → JWT verify chỉ kiểm tra chữ ký và thời hạn
     *  → Không biết token đã bị REVOKE (thu hồi) chưa
     *  → Khi user đăng xuất hoặc admin thu hồi phiên → xóa khỏi DB
     *  → Verify JWT vẫn pass nhưng DB không có → phiên đã bị thu hồi → 401
     *
     * Đây là điểm then chốt: Lưu refresh token trong DB cho phép REVOKE bất cứ lúc nào
     * (điều JWT thuần túy không làm được vì JWT là stateless)
     */
    const stored = await prisma.refresh_tokens.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expires_at < new Date()) {
      // Token đã bị revoke hoặc hết hạn theo DB → Clear Cookie và báo lỗi
      await prisma.refresh_tokens.deleteMany({ where: { token: refreshToken } });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({ message: "Phiên đã hết hạn" });
    }

    /**
     * BƯỚC 3: Lấy thông tin user mới nhất từ DB.
     * Tại sao không chỉ dùng payload từ JWT?
     *  → User có thể bị BANNED sau khi login → token cũ vẫn pass JWT verify
     *  → Kiểm tra DB đảm bảo user vẫn ACTIVE
     *  → Lấy role mới nhất (nếu admin thay đổi role của user)
     */
    const user = await prisma.users.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      // User không tồn tại hoặc bị khóa/ban → xóa tất cả refresh tokens
      await prisma.refresh_tokens.deleteMany({
        where: { user_id: payload.id },
      });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({ message: "Phiên không còn hợp lệ" });
    }

    /**
     * BƯỚC 4: Tạo Access Token mới và gắn vào response header.
     *
     * Frontend (axios interceptor) sẽ bắt header "x-access-token" này:
     *   const refreshedToken = response.headers["x-access-token"];
     *   if (refreshedToken) localStorage.setItem("token", refreshedToken);
     *
     * Header "x-auth-refreshed" để debug/logging (tùy chọn)
     */
    const role = user.role?.name ?? "USER";
    const accessToken = createAccessToken(user.id, user.email, role);
    res.setHeader("x-access-token", accessToken); // ← Frontend sẽ cập nhật localStorage
    res.setHeader("x-auth-refreshed", "true");    // ← Báo hiệu đã refresh

    /**
     * BƯỚC 5: Gắn thông tin user vào request object để controller dùng.
     * req.user sẽ được controller đọc: const userId = req.user.id
     */
    (req as any).user = { id: user.id, email: user.email, role };
    return next(); // ✅ Tiếp tục đến controller

  } catch {
    // JWT verify fail hoặc lỗi DB → Dọn dẹp và báo lỗi
    await prisma.refresh_tokens.deleteMany({ where: { token: refreshToken } });
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(401).json({ message: "Phiên đã hết hạn" });
  }
};

/**
 * MIDDLEWARE CHÍNH: protectedRoute
 *
 * Đây là function được import và dùng trong các route file.
 * Express gọi middleware này theo thứ tự trước controller.
 *
 * Express middleware pattern: (req, res, next) => void
 *  - next() = cho request đi tiếp đến middleware/controller tiếp theo
 *  - res.status().json() = dừng lại và trả response ngay
 */
export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    /**
     * Không có Authorization header → Không có access token
     * → Thử dùng Refresh Token trong Cookie thay thế
     */
    if (!authHeader) {
      return continueWithRefreshToken(req, res, next);
    }

    /**
     * Format chuẩn: "Bearer eyJhbGci..."
     * Tách để lấy phần token (bỏ chữ "Bearer ")
     */
    const token = authHeader.split(" ")[1];
    if (!token) {
      return continueWithRefreshToken(req, res, next);
    }

    /**
     * Verify Access Token:
     *  - Kiểm tra chữ ký (đảm bảo token do server tạo, không bị giả mạo)
     *  - Kiểm tra thời hạn (trường exp trong payload)
     *
     * jwt.verify() throw exception nếu không hợp lệ → catch phía dưới
     */
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    /**
     * Token hợp lệ → Lưu thông tin user vào req để controller dùng.
     * Controller đọc: const userId = (req as any).user.id
     */
    (req as any).user = decoded;
    return next(); // ✅ Token OK, cho qua

  } catch (error) {
    /**
     * Phân loại lỗi từ jwt.verify():
     *  - TokenExpiredError: Token hết hạn (bình thường, thử refresh)
     *  - JsonWebTokenError: Token bị giả mạo/corrupt (nguy hiểm, từ chối ngay)
     *  - NotBeforeError: Token chưa đến thời hạn dùng (hiếm)
     */
    if (error instanceof jwt.TokenExpiredError) {
      // Token hết hạn → Thử dùng Refresh Token trong Cookie
      return continueWithRefreshToken(req, res, next);
    }
    // Token không hợp lệ (bị giả mạo hoặc ký sai secret) → Từ chối ngay
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
};
