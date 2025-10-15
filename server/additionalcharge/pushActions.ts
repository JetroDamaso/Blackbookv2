"use server";

import { prisma } from "@/server/db";

export async function createAdditionalCharge(data: {
  name: string;
  amount: number;
  description?: string;
  note?: string;
}) {
  try {
    const additionalCharge = await prisma.additionalCharge.create({
      data: {
        name: data.name,
        amount: data.amount,
        description: data.description,
        note: data.note,
      },
    });

    return additionalCharge;
  } catch (error: any) {
    throw new Error("Failed to create additional charge: " + error.message);
  }
}
