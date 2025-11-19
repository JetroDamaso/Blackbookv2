"use server";

import { prisma } from "@/server/db";
import { updateBookingStatus } from "../Booking/pushActions";

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

    // Update booking status after adding additional charge
    try {
      await updateBookingStatus(data.bookingId);
    } catch (statusError) {
      console.error("Failed to update booking status after adding additional charge:", statusError);
      // Don't throw - additional charge was created successfully
    }

    return additionalCharge;
  } catch (error: any) {
    throw new Error("Failed to create additional charge: " + error.message);
  }
}

export async function deleteAdditionalCharge(id: number) {
  try {
    // Get the charge first to retrieve bookingId
    const charge = await prisma.additionalCharge.findUnique({
      where: { id },
      select: { bookingId: true },
    });

    await prisma.additionalCharge.delete({
      where: { id },
    });

    // Update booking status after deleting additional charge
    if (charge?.bookingId) {
      try {
        await updateBookingStatus(charge.bookingId);
      } catch (statusError) {
        console.error("Failed to update booking status after deleting additional charge:", statusError);
        // Don't throw - charge was deleted successfully
      }
    }

    return { success: true };
  } catch (error: any) {
    throw new Error("Failed to delete additional charge: " + error.message);
  }
}
