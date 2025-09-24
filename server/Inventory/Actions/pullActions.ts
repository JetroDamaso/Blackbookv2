"use server";
import { prisma } from "@/server/db";

export async function getAllInventory() {
  try {
    const data = await prisma.inventoryItem.findMany({
      include: { category: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch inventory items", error);
    throw error;
  }
}

export async function getInventoryByCategory(categoryId: number) {
  try {
    const data = await prisma.inventoryItem.findMany({
      where: {
        categoryId: categoryId,
      },
      include: { category: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch inventory items", error);
    throw error;
  }
}

export async function getInventoryCategories() {
  try {
    const data = await prisma.inventoryCategory.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch inventory categories", error);
    throw error;
  }
}

export async function getInventoryStatus() {
  try {
    const data = await prisma.inventoryStatus.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch inventory status", error);
    throw error;
  }
}
