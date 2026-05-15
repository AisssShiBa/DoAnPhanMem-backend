import prisma from "../config/prisma";
import type { Request, Response } from "express";
export const getActivityHeatmap = async (req: any, res: Response) => {
  try {
    // Lấy toàn bộ Activity_Logs trong 4 tuần gần nhất
    const since = new Date();
    since.setDate(since.getDate() - 28);

    const logs = await prisma.activity_Logs.findMany({
      where: {
        created_at: { gte: since },
      },
      select: {
        created_at: true,
      },
    });

    // Tạo bảng 7 ngày x 24 giờ, đếm số log rơi vào mỗi ô
    // day: 0=T2, 1=T3, ... 6=CN  (getDay() trả 0=CN nên cần đổi)
    const matrix: Record<string, number> = {};

    for (const log of logs) {
      if (!log.created_at) continue;

      const d = log.created_at.getDay(); // 0=CN, 1=T2, ..., 6=T7
      // Đổi sang: 0=T2, 1=T3, ..., 5=T7, 6=CN
      const day = d === 0 ? 6 : d - 1;
      const hour = log.created_at.getHours();

      const key = `${day}_${hour}`;
      matrix[key] = (matrix[key] ?? 0) + 1;
    }

    // Chuyển thành mảng { day, hour, count }
    const cells = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        cells.push({
          day,
          hour,
          count: matrix[`${day}_${hour}`] ?? 0,
        });
      }
    }

    return res.json({ cells });
  } catch {
    return res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
