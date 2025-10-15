"use server";
import { prisma } from "../db";

export async function getAllModeOfPayments() {
  try {
    const data = await prisma.modeOfPayment.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all mode of payments", error);
    throw error;
  }
}

export async function getModeOfPaymentById(id: number) {
  try {
    const data = await prisma.modeOfPayment.findUnique({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch mode of payment", error);
    throw error;
  }
}
