import { prisma } from "../db";
export async function getAllDiscount() {
  try {
    const data = await prisma.discount.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch discounts", error);
    throw error;
  }
}

export async function getModeOfPayments() {
  try {
    const data = await prisma.modeOfPayment.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch mode of payments", error);
    throw error;
  }
}
