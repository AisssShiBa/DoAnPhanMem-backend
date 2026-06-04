import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Không lấy được email từ Google"), false);
        }

        let user = await prisma.users.findUnique({
          where: { email },
          include: { role: true },
        });

        if (user) {
          if (user.status === "PENDING") {
            user = await prisma.users.update({
              where: { email },
              data: {
                status: "ACTIVE",
                verify_token: null,
                verify_expires: null,
              },
              include: { role: true },
            });
          }

          return done(null, user);
        }

        const userRole = await prisma.roles.findFirst({
          where: { name: "USER" },
        });

        user = await prisma.users.create({
          data: {
            email,
            full_name: profile.displayName || "Google User",
            provider: "google",
            status: "ACTIVE",
            password_hash: "",
            role_id: userRole?.id ?? null,
          },
          include: { role: true },
        });

        return done(null, user);
      } catch (error) {
        console.error("Lỗi xác thực Google:", error);
        return done(error, false);
      }
    },
  ),
);

export default passport;
