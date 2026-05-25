import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const createAccessToken = (id: number, email: string, role: string) =>
  jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "15m" } as SignOptions);

const continueWithRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { id: number };
    const stored = await prisma.refresh_tokens.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expires_at < new Date()) {
      await prisma.refresh_tokens.deleteMany({ where: { token: refreshToken } });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({ message: "Phiên đã hết hạn" });
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });
    if (!user || user.status !== "ACTIVE") {
      await prisma.refresh_tokens.deleteMany({
        where: { user_id: payload.id },
      });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(401).json({ message: "Phiên không còn hợp lệ" });
    }

    const role = user.role?.name ?? "USER";
    const accessToken = createAccessToken(user.id, user.email, role);
    res.setHeader("x-access-token", accessToken);
    res.setHeader("x-auth-refreshed", "true");
    (req as any).user = { id: user.id, email: user.email, role };
    return next();
  } catch {
    await prisma.refresh_tokens.deleteMany({ where: { token: refreshToken } });
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(401).json({ message: "Phiên đã hết hạn" });
  }
};

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return continueWithRefreshToken(req, res, next);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return continueWithRefreshToken(req, res, next);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };

    (req as any).user = decoded;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return continueWithRefreshToken(req, res, next);
    }
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
};
