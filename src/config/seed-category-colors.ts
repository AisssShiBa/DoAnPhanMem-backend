import prisma from "./prisma";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#3b82f6",
  "#06b6d4",
] as const;

async function main() {
  const categories = await prisma.categories.findMany({
    where: { color_code: null, is_deleted: false },
    orderBy: { id: "asc" },
  });

  console.log(`Cần seed màu cho ${categories.length} category...`);

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    // Guard: categories[i] is always defined here, but satisfies strict mode
    if (!category) continue;

    const colorIndex = i % COLORS.length;
    const color = COLORS[colorIndex] as string;

    await prisma.categories.update({
      where: { id: category.id },
      data: { color_code: color },
    });
  }

  console.log("✅ Seed màu hoàn tất!");
  await prisma.$disconnect();
}

main().catch(console.error);
