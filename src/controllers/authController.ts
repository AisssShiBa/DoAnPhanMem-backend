// authController.ts
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import passport from "../config/passport";
import prisma from "../config/prisma";
import type { SignOptions } from "jsonwebtoken";
import {
  sendVerifyEmail,
  sendResetPasswordEmail,
} from "../services/mailService";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const REFRESH_TTL_SHORT = 1 * 24 * 60 * 60 * 1000;
const REFRESH_TTL_LONG = 30 * 24 * 60 * 60 * 1000;
const LOGIN_LOG_DEBOUNCE_MS = 10 * 60 * 1000;
const ACTIVITY_LOG_RETENTION_DAYS = 180;

/* ==================================================
   VALIDATION
================================================== */
const signupSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const signinSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  rememberMe: z.boolean().optional().default(false),
});

/* ==================================================
   TOKEN HELPERS
================================================== */
const createToken = (
  id: number,
  email: string,
  role: string,
  expiresIn: string,
) => jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn } as SignOptions);

const createRefreshToken = (id: number, rememberMe: boolean) => {
  const ttl = rememberMe ? "30d" : "1d";
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: ttl } as SignOptions);
};

function setRefreshCookie(res: Response, token: string, rememberMe: boolean) {
  const maxAge = rememberMe ? REFRESH_TTL_LONG : REFRESH_TTL_SHORT;
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge,
    path: "/",
  });
}

const cleanupExpiredRefreshTokens = (userId?: number) =>
  prisma.refresh_tokens.deleteMany({
    where: {
      expires_at: { lt: new Date() },
      ...(userId ? { user_id: userId } : {}),
    },
  });

const cleanupOldActivityLogs = () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ACTIVITY_LOG_RETENTION_DAYS);
  return prisma.activity_Logs.deleteMany({
    where: { created_at: { lt: cutoff } },
  });
};

const recordLoginActivity = async (userId: number, action: string) => {
  const since = new Date(Date.now() - LOGIN_LOG_DEBOUNCE_MS);
  const recent = await prisma.activity_Logs.findFirst({
    where: {
      user_id: userId,
      action,
      created_at: { gte: since },
    },
  });

  if (!recent) {
    await prisma.activity_Logs.create({
      data: { user_id: userId, action },
    });
  }
};

/* ==================================================
   SIGN UP
================================================== */
export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Dữ liệu không hợp lệ", details: parsed.error.issues });

    const { fullName, email, password } = parsed.data;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ error: "Email đã được sử dụng" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = await prisma.roles.findFirst({ where: { name: "USER" } });
    if (!userRole)
      return res
        .status(500)
        .json({ error: "Chưa có role USER trong database" });

    const verifyToken = createToken(0, email, "USER", "15m");
    const user = await prisma.users.create({
      data: {
        full_name: fullName,
        email,
        password_hash: hashedPassword,
        provider: "email",
        status: "PENDING",
        role_id: userRole.id,
        verify_token: verifyToken,
        verify_expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      await sendVerifyEmail(email, fullName, encodeURIComponent(verifyToken));
    } catch (mailError) {
      console.log("Lỗi gửi mail:", mailError);
    }

    return res.status(201).json({
      message: "Đăng ký thành công. Kiểm tra email để xác minh.",
      userId: user.id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   VERIFY EMAIL
================================================== */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const raw = req.query.token as string;
    if (!raw) return res.status(400).json({ error: "Thiếu token" });

    const token = decodeURIComponent(raw);
    const user = await prisma.users.findFirst({
      where: { verify_token: token },
    });

    if (!user) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        const existing = await prisma.users.findUnique({
          where: { email: decoded.email },
        });
        if (existing?.status === "ACTIVE")
          return res.status(200).json({ message: "Xác minh email thành công" });
      } catch {}
      return res.status(400).json({ error: "Token không hợp lệ" });
    }

    if (user.verify_expires && new Date(user.verify_expires) < new Date())
      return res.status(400).json({ error: "Token đã hết hạn" });

    await prisma.users.update({
      where: { id: user.id },
      data: { status: "ACTIVE", verify_token: null, verify_expires: null },
    });

    return res.status(200).json({ message: "Xác minh email thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   SIGN IN
================================================== */
export const signin = async (req: Request, res: Response) => {
  try {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Dữ liệu không hợp lệ", details: parsed.error.issues });

    const { email, password, rememberMe = false } = parsed.data;

    const user = await prisma.users.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user)
      return res.status(401).json({ error: "Không tìm thấy tài khoản" });

    if (user.provider === "google")
      return res.status(400).json({ error: "Hãy đăng nhập bằng Google" });

    if (user.status !== "ACTIVE")
      return res.status(403).json({ error: "Vui lòng xác minh email trước" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: "Sai mật khẩu" });
    await Promise.all([
      cleanupExpiredRefreshTokens(user.id),
      cleanupOldActivityLogs(),
      recordLoginActivity(user.id, "Đăng nhập thành công"),
    ]);
    const roleName = user.role?.name ?? "USER";
    const accessToken = createToken(user.id, user.email, roleName, "15m");
    const refreshToken = createRefreshToken(user.id, rememberMe);
    const ttlMs = rememberMe ? REFRESH_TTL_LONG : REFRESH_TTL_SHORT;

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + ttlMs),
        device_info: (req.headers["user-agent"] ?? "unknown").slice(0, 255),
        ip_address: (req.ip ?? "unknown").slice(0, 50),
      },
    });

    setRefreshCookie(res, refreshToken, rememberMe);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token: accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: roleName,
        provider: user.provider,
        status: user.status,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   LOGOUT
================================================== */
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) {
      await prisma.refresh_tokens.deleteMany({ where: { token } });
    }
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(200).json({ message: "Đã đăng xuất thành công." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   LOGOUT ALL
================================================== */
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as number;
    await prisma.refresh_tokens.deleteMany({ where: { user_id: userId } });
    res.clearCookie("refreshToken", { path: "/" });
    return res
      .status(200)
      .json({ message: "Đã đăng xuất khỏi tất cả thiết bị." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   REFRESH TOKEN
================================================== */
export const refresh = async (req: Request, res: Response) => {
  try {
    await cleanupExpiredRefreshTokens();

    const token = req.cookies?.refreshToken as string | undefined;
    if (!token)
      return res.status(401).json({ error: "Không có refresh token." });

    let payload: { id: number };
    try {
      payload = jwt.verify(token, REFRESH_SECRET) as { id: number };
    } catch {
      await prisma.refresh_tokens.deleteMany({ where: { token } });
      res.clearCookie("refreshToken", { path: "/" });
      return res
        .status(401)
        .json({ error: "Refresh token không hợp lệ hoặc đã hết hạn." });
    }

    const stored = await prisma.refresh_tokens.findUnique({ where: { token } });
    if (!stored || stored.expires_at < new Date()) {
      res.clearCookie("refreshToken", { path: "/" });
      return res
        .status(401)
        .json({ error: "Phiên đã hết hạn. Vui lòng đăng nhập lại." });
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });
    if (!user)
      return res.status(401).json({ error: "Người dùng không tồn tại." });

    if (user.status !== "ACTIVE") {
      await prisma.refresh_tokens.deleteMany({ where: { user_id: user.id } });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(403).json({ error: "Phiên không còn hợp lệ." });
    }

    const remainingMs = stored.expires_at.getTime() - Date.now();
    const isLong = remainingMs > REFRESH_TTL_SHORT;
    const newRefresh = createRefreshToken(payload.id, isLong);

    await prisma.refresh_tokens.update({
      where: { token },
      data: { token: newRefresh, expires_at: stored.expires_at },
    });
    setRefreshCookie(res, newRefresh, isLong);

    const roleName = user.role?.name ?? "USER";
    const accessToken = createToken(user.id, user.email, roleName, "15m");

    return res.status(200).json({
      token: accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: roleName,
        provider: user.provider,
        status: user.status,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   GET SESSIONS
================================================== */
export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as number;
    const currentToken = req.cookies?.refreshToken as string | undefined;

    const sessions = await prisma.refresh_tokens.findMany({
      where: { user_id: userId, expires_at: { gt: new Date() } },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        device_info: true,
        ip_address: true,
        created_at: true,
        expires_at: true,
        token: true,
      },
    });

    return res.status(200).json({
      sessions: sessions.map((s) => ({
        id: s.id,
        device_info: s.device_info,
        ip_address: s.ip_address,
        created_at: s.created_at,
        expires_at: s.expires_at,
        is_current: s.token === currentToken,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   REVOKE SESSION
================================================== */
export const revokeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as number;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) return res.status(400).json({ error: "ID phiên không hợp lệ." });

    const session = await prisma.refresh_tokens.findUnique({ where: { id } });
    if (!session || session.user_id !== userId)
      return res.status(404).json({ error: "Phiên không tồn tại." });

    await prisma.refresh_tokens.delete({ where: { id } });
    return res.status(200).json({ message: "Đã thu hồi phiên." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   GOOGLE LOGIN
================================================== */
export const googleAuth = passport.authenticate("google", {
  scope: ["email", "profile"],
  session: false,
});

export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate(
    "google",
    { session: false },
    async (
      err: Error,
      user: { id: number; email: string; role?: { name: string } },
    ) => {
      if (err || !user)
        return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);

      await Promise.all([
        cleanupExpiredRefreshTokens(user.id),
        cleanupOldActivityLogs(),
        recordLoginActivity(user.id, "Đăng nhập Google"),
      ]).catch(() => {});

      const roleName = user.role?.name ?? "USER";
      const accessToken = createToken(user.id, user.email, roleName, "15m");
      const refreshToken = createRefreshToken(user.id, false);

      await prisma.refresh_tokens
        .create({
          data: {
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + REFRESH_TTL_SHORT),
            device_info: (req.headers["user-agent"] ?? "unknown").slice(0, 255),
            ip_address: (req.ip ?? "unknown").slice(0, 50),
          },
        })
        .catch(() => {});

      // ✅ Set cookie để refresh token hoạt động
      setRefreshCookie(res, refreshToken, false);

      return res.redirect(`${FRONTEND_URL}/auth/callback?token=${accessToken}`);
    },
  )(req, res);
};

/* ==================================================
   GET PROFILE
================================================== */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token không hợp lệ" });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        full_name: true,
        email: true,
        provider: true,
        status: true,
        phone: true,
        school: true,
        major: true,
        role: { select: { name: true } },
        settings: true,
      },
    });

    return res.status(200).json({ user });
  } catch {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
};

/* ==================================================
   FORGOT PASSWORD
================================================== */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return res
        .status(200)
        .json({ message: "Nếu email tồn tại, hướng dẫn đã được gửi." });

    const resetToken = createToken(user.id, user.email, "USER", "15m");
    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      await sendResetPasswordEmail(
        email,
        user.full_name ?? "bạn",
        encodeURIComponent(resetToken),
      );
    } catch (mailError) {
      console.log(mailError);
    }

    return res
      .status(200)
      .json({ message: "Nếu email tồn tại, hướng dẫn đã được gửi." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/* ==================================================
   RESET PASSWORD
================================================== */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token: rawToken, password } = req.body;
    const token = decodeURIComponent(rawToken);

    const user = await prisma.users.findFirst({
      where: { reset_token: token },
    });
    if (!user) return res.status(400).json({ error: "Token không hợp lệ" });

    if (user.reset_expires && new Date(user.reset_expires) < new Date())
      return res.status(400).json({ error: "Token đã hết hạn" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_expires: null,
      },
    });

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
