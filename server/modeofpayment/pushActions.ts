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
