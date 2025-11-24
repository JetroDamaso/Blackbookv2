"use server";

import { prisma } from "@/server/db";

export async function createModeOfPayment(data: { name: string }) {
  try {
    const modeOfPayment = await prisma.modeOfPayment.create({
      data: {
        name: data.name,
      },
    });

    return modeOfPayment;
  } catch (error: any) {
    throw new Error("Failed to create mode of payment: " + error.message);
  }
}

export async function deleteModeOfPayment(id: number) {
  try {
    const data = await prisma.modeOfPayment.update({
      where: { id },
      data: { isDeleted: true },
    });
    return data;
  } catch (error: any) {
    throw new Error("Failed to delete mode of payment: " + error.message);
  }
}

export async function updateModeOfPayment(id: number, name: string) {
  try {
    const data = await prisma.modeOfPayment.update({
      where: { id },
      data: { name },
    });
    return data;
  } catch (error: any) {
    throw new Error("Failed to update mode of payment: " + error.message);
  }
}
