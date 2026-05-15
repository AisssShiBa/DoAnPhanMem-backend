import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma";

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#10b981",
  blue: "#3b82f6",
  indigo: "#6366f1",
  purple: "#a855f7",
  pink: "#ec4899",
};

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
              data: { status: "ACTIVE" },
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

        try {
          const defaultTags = await prisma.tags.findMany({
            where: { user_id: null, is_deleted: false },
          });
          if (defaultTags.length > 0) {
            await prisma.tags.createMany({
              data: defaultTags.map((tag) => ({
                user_id: user!.id,
                name: tag.name,
                color_code:
                  COLOR_MAP[tag.color_code ?? ""] ??
                  tag.color_code ??
                  "#6366f1",
                is_deleted: false,
              })),
            });
          }
        } catch (tagErr) {
          console.error("Lỗi copy default tags Google:", tagErr);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Lỗi xác thực Google:", error);
        return done(error, false);
      }
    },
  ),
);

export default passport;
