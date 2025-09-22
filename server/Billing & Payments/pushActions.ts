import { prisma } from "../db";
export async function getInventoryCategories() {
  try {
    const data = await prisma.inventoryCategory.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch inventory categories", error);
    throw error;
  }
}
