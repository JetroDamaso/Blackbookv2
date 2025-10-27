"use server";
import { prisma } from "../db";

export async function createDiscount(data: {
  name: string;
  percent?: number;
  amount?: number;
  description?: string;
  isActive?: boolean;
}) {
  try {
    const discount = await prisma.discount.create({
      data: {
        name: data.name,
        percent: data.percent,
        amount: data.amount,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
    return discount;
  } catch (error) {
    console.error("Failed to create discount", error);
    throw error;
  }
}

export async function updateDiscount(
  id: number,
  data: {
    name?: string;
    percent?: number;
    amount?: number;
    description?: string;
    isActive?: boolean;
  }
) {
  try {
    const discount = await prisma.discount.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.percent !== undefined && { percent: data.percent }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return discount;
  } catch (error) {
    console.error("Failed to update discount", error);
    throw error;
  }
}

export async function deleteDiscount(id: number) {
  try {
    // Soft delete: set isDeleted to true instead of hard deleting
    const discount = await prisma.discount.update({
      where: { id },
      data: { isDeleted: true },
    });
    return discount;
  } catch (error) {
    console.error("Failed to delete discount", error);
    throw error;
  }
}
