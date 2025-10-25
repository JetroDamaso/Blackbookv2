"use server";
import { prisma } from "../db";
import { updateBookingStatus } from "../Booking/pushActions";

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
  yve?: number,
  discountAmount?: number,
  discountId?: number,
  isCustomDiscount?: boolean,
  catering?: number,
  cateringPerPaxAmount?: number
) {
  try {
    const data = await prisma.billing.create({
      data: {
        bookingId: bookingId,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discountType: discountType,
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        discountId: discountId,
        isCustomDiscount: isCustomDiscount || false,
        balance: balance,
        modeOfPayment: modeOfPayment,
        yve: yve,
        deposit: deposit,
        status: status,
        dateCompleted: dateComplpeted,
        catering: catering,
        cateringPerPaxAmount: cateringPerPaxAmount,
      },
    });

    // Update booking status after billing is created
    try {
      await updateBookingStatus(bookingId);
    } catch (statusError) {
      console.error("Failed to update booking status after billing creation:", statusError);
      // Don't throw - billing was created successfully
    }

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
  notes?: string,
  orNumber?: string
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
        orNumber: orNumber,
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

    // Update booking status after payment is added
    if (data.billing?.booking?.id) {
      try {
        await updateBookingStatus(data.billing.booking.id);
      } catch (statusError) {
        console.error("Failed to update booking status after payment:", statusError);
        // Don't throw - payment was created successfully
      }
    }

    return data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}
