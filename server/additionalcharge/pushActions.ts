"use server";

import { prisma } from "@/server/db";

export async function createAdditionalCharge(data: {
  bookingId: number;
  name: string;
  amount: number;
  description?: string;
  note?: string;
}) {
  try {
    const additionalCharge = await prisma.additionalCharge.create({
      data: {
        bookingId: data.bookingId,
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

export async function deleteAdditionalCharge(id: number) {
  try {
    await prisma.additionalCharge.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    throw new Error("Failed to delete additional charge: " + error.message);
  }
}
