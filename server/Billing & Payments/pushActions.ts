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

export async function createPayment(
  billingId: number,
  clientId: number,
  amount: number,
  status: string,
  date?: Date,
  notes?: string
) {
  try {
    const data = await prisma.payment.create({
      data: {
        billingId: billingId,
        clientId: clientId,
        amount: amount,
        status: status,
        date: date || new Date(),
        notes: notes,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        billing: {
          select: {
            id: true,
            booking: {
              select: {
                eventName: true,
                id: true,
              },
            },
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}
