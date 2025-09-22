import { prisma } from "@/server/db";

export async function getAllDishes() {
  try {
    const data = await prisma.dish.findMany({
      include: { category: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch dishes", error);
    throw error;
  }
}

export async function getDishesByCategory(categoryId: number) {
  try {
    const data = await prisma.dish.findMany({
      where: {
        categoryId: categoryId,
      },
      include: { category: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch dishes", error);
    throw error;
  }
}

export async function getDishCategories() {
  try {
    const data = await prisma.dishCategory.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch dishes", error);
    throw error;
  }
}
