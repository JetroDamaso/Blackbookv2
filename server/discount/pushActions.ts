"use server";
import { prisma } from "../db";

export async function createDiscount(data: {
  name: string;
  percent: number;
}) {
  try {
    const discount = await prisma.discount.create({
      data: {
        name: data.name,
        percent: data.percent,
      },
    });
    return discount;
  } catch (error) {
    console.error("Failed to create discount", error);
    throw error;
  }
}
