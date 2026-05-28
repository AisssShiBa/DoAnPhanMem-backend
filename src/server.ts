import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";
import { startReminderJob } from "./jobs/reminderJob";
import { verifyMailConnection } from "./services/mailService";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Kết nối database thành công");

    verifyMailConnection();

    startReminderJob();

    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại cổng ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khởi động server:", error);
    process.exit(1);
  }
}

startServer();
