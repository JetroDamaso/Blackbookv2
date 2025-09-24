"use server";
import { prisma } from "../db";

export async function createBilling(
  bookingId: number,
  originalPrice: number,
  discountedPrice: number,
  discountType: string,
  discountPercentage: number,
  balance: number,
  modeOfPayment: string,
  status: number,
  deposit: number,
  dateComplpeted?: Date,
  yve?: number
) {
  try {
    const data = await prisma.billing.create({
      data: {
        bookingId: bookingId,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discountType: discountType,
        discountPercentage: discountPercentage,
        balance: balance,
        modeOfPayment: modeOfPayment,
        yve: yve,
        deposit: deposit,
        status: status,
        dateCompleted: dateComplpeted,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating billing:", error);
  }
}
