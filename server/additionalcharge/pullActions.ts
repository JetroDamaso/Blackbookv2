"use server";
import { prisma } from "../db";

export async function getAllAdditionalCharges() {
  try {
    const data = await prisma.additionalCharge.findMany({
      include: {
        booking: {
          select: {
            id: true,
            eventName: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all additional charges", error);
    throw error;
  }
}

export async function getAdditionalChargeById(id: number) {
  try {
    const data = await prisma.additionalCharge.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            eventName: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch additional charge", error);
    throw error;
  }
}

export async function getAdditionalChargesByBookingId(bookingId: number) {
  try {
    const data = await prisma.additionalCharge.findMany({
      where: { bookingId },
      include: {
        booking: {
          select: {
            id: true,
            eventName: true,
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch additional charges by booking", error);
    throw error;
  }
}
