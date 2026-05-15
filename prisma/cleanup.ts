import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Xóa tất cả tasks rồi seed lại
  await prisma.tasks.deleteMany({});
  console.log("✅ Đã xóa hết tasks");
}

main().finally(() => prisma.$disconnect());
