/**
 * ============================================================
 * config/passport.ts – Cấu hình Google OAuth với Passport.js
 * ============================================================
 *
 * File này cấu hình chiến lược (Strategy) để đăng nhập bằng Google OAuth 2.0.
 *
 * Tại sao dùng Passport.js thay vì tự implement OAuth?
 *  → OAuth 2.0 là giao thức nhiều bước phức tạp:
 *    1. Tạo authorization URL với đúng params (client_id, scope, redirect_uri, state...)
 *    2. Nhận authorization code từ Google callback
 *    3. Exchange code lấy access_token + id_token
 *    4. Verify id_token (JWT từ Google)
 *    5. Gọi Google API lấy profile
 *    → Nếu tự làm: ~150 dòng code, dễ sai, khó maintain
 *
 *  → Passport.js: Đã implement đúng chuẩn, battle-tested, chỉ cần config
 *    Strategy Pattern: Mỗi provider (Google, Facebook, GitHub...) là một "strategy"
 *    Thêm provider mới chỉ cần thêm strategy, không đụng code gốc
 *
 * Luồng OAuth 2.0 đầy đủ:
 *  1. User click "Đăng nhập Google" → Frontend redirect đến /api/auth/google
 *  2. passport.authenticate("google") → Passport redirect đến Google consent screen
 *  3. User đăng nhập Google, chọn tài khoản, chấp nhận
 *  4. Google redirect về callbackURL với authorization code
 *  5. Passport tự exchange code → nhận access_token + profile từ Google
 *  6. Callback function trong new GoogleStrategy được gọi với profile
 *  7. Mình xử lý: tìm hoặc tạo user trong DB
 *  8. Backend tạo JWT tokens → redirect về frontend với access token
 *
 * session: false (trong passport.authenticate) vì:
 *  → Mình dùng JWT thay vì Passport session
 *  → Không cần serializeUser/deserializeUser
 */

import dotenv from "dotenv";
dotenv.config(); // Load .env trước khi dùng process.env

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma";

/**
 * Đăng ký chiến lược Google OAuth với Passport.
 *
 * Passport.use() nhận một Strategy object.
 * Khi passport.authenticate("google") được gọi, Passport tìm Strategy có tên "google"
 * và dùng config + callback này.
 */
passport.use(
  new GoogleStrategy(
    {
      // Thông tin từ Google Cloud Console (đăng ký OAuth app)
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

      /**
       * URL Google sẽ redirect về sau khi user xác nhận.
       * PHẢI khớp với URL đã đăng ký trong Google Cloud Console.
       * Dev: http://localhost:3000/api/auth/google/callback
       * Prod: https://api.softwhere.online/api/auth/google/callback (ví dụ)
       */
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/google/callback",
    },

    /**
     * Callback được gọi SAU KHI Passport hoàn tất exchange với Google.
     *
     * @param _accessToken - Access token của Google (để gọi Google APIs khác nếu cần)
     *   Mình không dùng vì chỉ cần profile, không cần gọi thêm Google API
     * @param _refreshToken - Refresh token Google (khác với refresh token của app mình)
     *   Mình không dùng vì mình có cơ chế refresh token riêng
     * @param profile - Thông tin profile từ Google (email, tên, avatar...)
     * @param done - Callback để báo Passport kết quả (thành công hay thất bại)
     *   done(null, user) = thành công
     *   done(error, false) = thất bại
     */
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        /**
         * Lấy email từ profile Google.
         * profile.emails là mảng vì Google account có thể có nhiều email.
         * [0].value = email chính (primary email).
         */
        const email = profile.emails?.[0]?.value;
        if (!email) {
          // Hiếm gặp: Google không cấp email (user đã revoke quyền email)
          return done(new Error("Không lấy được email từ Google"), false);
        }

        /**
         * TÌM USER TRONG DB theo email.
         *
         * Tại sao tìm theo email thay vì google_id?
         *  → Người dùng có thể đã đăng ký tài khoản bằng email trước đó
         *  → Khi đăng nhập Google lần đầu, ghép tài khoản theo email
         *  → Tránh tạo duplicate account cho cùng 1 người
         */
        let user = await prisma.users.findUnique({
          where: { email },
          include: { role: true },
        });

        if (user) {
          if (user.is_deleted) {
            return done(new Error("account_disabled"), false);
          }

          if (user.status === "BANNED") {
            return done(new Error("account_banned"), false);
          }

          /**
           * USER ĐÃ TỒN TẠI trong DB.
           *
           * Trường hợp đặc biệt: User đã đăng ký email nhưng chưa verify
           * (status = "PENDING") → Tự động ACTIVE vì Google đã xác thực email rồi
           * → Không cần verify email thêm
           */
          if (user.status === "PENDING") {
            user = await prisma.users.update({
              where: { email },
              data: {
                status: "ACTIVE",
                verify_token: null,   // Xóa token verify email (không cần nữa)
                verify_expires: null, // Xóa expiry
              },
              include: { role: true },
            });
          }

          // Trả user về để authController.googleCallback xử lý tiếp
          return done(null, user);
        }

        /**
         * USER CHƯA TỒN TẠI → Tạo tài khoản mới tự động.
         *
         * Đặc điểm tài khoản Google:
         *  - provider: "google" (phân biệt với "email")
         *  - status: "ACTIVE" ngay (không cần verify email)
         *  - password_hash: "" (không có mật khẩu, không thể đăng nhập bằng email+pass)
         *    Nhưng user có thể TẠO mật khẩu sau trong trang Settings
         *  - full_name: Lấy từ profile.displayName (tên Google của user)
         */
        const userRole = await prisma.roles.findFirst({
          where: { name: "USER" },
        });

        user = await prisma.users.create({
          data: {
            email,
            full_name: profile.displayName || "Google User",
            provider: "google",
            status: "ACTIVE",
            password_hash: "", // Trống vì không có mật khẩu
            role_id: userRole?.id ?? null,
          },
          include: { role: true },
        });

        return done(null, user); // ✅ Tạo thành công, trả user về
      } catch (error) {
        console.error("Lỗi xác thực Google:", error);
        return done(error, false); // ❌ Lỗi DB hoặc unexpected error
      }
    },
  ),
);

export default passport;
