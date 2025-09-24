"use server";
import { prisma } from "../db";

export async function getBillingById(id: number) {
  try {
    const data = await prisma.billing.findMany({
      where: { bookingId:id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch event types", error);
    throw error;
  }
}

export async function getAllDiscount() {
  try {
    const data = await prisma.discount.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch discounts", error);
    throw error;
  }
}

export async function getDiscountById(discountId: number) {
  try {
    const data = await prisma.discount.findMany({
      where: {
        id: Number(discountId),
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch discounts", error);
    throw error;
  }
}

export async function getModeOfPayments() {
  try {
    const data = await prisma.modeOfPayment.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch mode of payments", error);
    throw error;
  }
}

export async function getEventTypeById(id: number) {
  try {
    const data = await prisma.eventTypes.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch event types", error);
    throw error;
  }
}

export async function getModeOfPaymentsById(id: number) {
  try {
    const data = await prisma.modeOfPayment.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch mode of payments", error);
    throw error;
  }
}
