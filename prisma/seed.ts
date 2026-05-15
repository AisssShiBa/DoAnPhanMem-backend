import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Seed Roles ────────────────────────────────────────
  const existingRoles = await prisma.roles.findMany({
    where: { name: { in: ["USER", "ADMIN"] } },
  });
  const existingNames = existingRoles.map((r) => r.name);

  if (!existingNames.includes("USER")) {
    await prisma.roles.create({ data: { name: "USER" } });
    console.log("✅ Đã tạo role USER");
  } else {
    console.log("ℹ️  Role USER đã tồn tại");
  }

  if (!existingNames.includes("ADMIN")) {
    await prisma.roles.create({ data: { name: "ADMIN" } });
    console.log("✅ Đã tạo role ADMIN");
  } else {
    console.log("ℹ️  Role ADMIN đã tồn tại");
  }

  // ── 2. Seed tài khoản ADMIN mặc định ────────────────────
  const adminRole = await prisma.roles.findFirst({ where: { name: "ADMIN" } });

  if (adminRole) {
    const adminExists = await prisma.users.findUnique({
      where: { email: "admin@system.com" },
    });

    if (!adminExists) {
      await prisma.users.create({
        data: {
          full_name: "System Admin",
          email: "admin@system.com",
          password_hash: await bcrypt.hash("Admin@123456", 10),
          provider: "email",
          status: "ACTIVE", // Không cần verify email
          role_id: adminRole.id,
        },
      });
      console.log("✅ Đã tạo tài khoản ADMIN:");
      console.log("   Email   : admin@system.com");
      console.log("   Password: Admin@123456");
      console.log("   ⚠️  Hãy đổi mật khẩu sau khi đăng nhập lần đầu!");
    } else {
      console.log("ℹ️  Tài khoản ADMIN đã tồn tại");
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
