"use server";
import { prisma } from "../db";

export async function getAllDiscounts() {
  try {
    const data = await prisma.discount.findMany({
      where: {
        isActive: true,
        isDeleted: { not: true }, // Only fetch non-deleted discounts
      },
      orderBy: {
        name: "asc",
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all discounts", error);
    throw error;
  }
}

export async function getDiscountById(id: number) {
  try {
    const data = await prisma.discount.findUnique({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch discount", error);
    throw error;
  }
}
