"use server";
import { prisma } from "../db";

export async function getBillingById(id: number) {
  try {
    const data = await prisma.billing.findMany({
      where: { bookingId: id },
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

export async function getAllPayments() {
  try {
    const data = await prisma.payment.findMany({
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
      orderBy: {
        date: "desc",
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch payments", error);
    throw error;
  }
}

export async function getPaymentsByBilling(billingId: number) {
  try {
    const data = await prisma.payment.findMany({
      where: { billingId },
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
            modeOfPayment: true,
            booking: {
              select: {
                eventName: true,
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return data || []; // Return empty array if no data
  } catch (error) {
    console.error("Failed to fetch payments by billing", error);
    return []; // Return empty array on error instead of throwing
  }
}

export async function getBillingSummary(billingId: number) {
  try {
    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
      include: {
        payments: true,
        booking: {
          select: {
            eventName: true,
            id: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // If no billing found, return default values
    if (!billing) {
      return {
        totalBilling: 0,
        totalPaid: 0,
        balance: 0,
        originalPrice: 0,
        discountType: "none",
        discountPercentage: 0,
        deposit: 0,
        yve: 0,
        modeOfPayment: "",
        eventName: "Unknown Event",
        clientName: "Unknown Client",
        bookingId: null,
        status: 0,
        payments: [],
        catering: null,
        cateringPerPaxAmount: null,
        isDefault: true,
      };
    }

    const totalPaid = billing.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const balance = billing.discountedPrice - totalPaid;
    const clientName = billing.booking?.client
      ? `${billing.booking.client.firstName} ${billing.booking.client.lastName}`
      : "Unknown Client";

    return {
      totalBilling: billing.discountedPrice || 0,
      totalPaid,
      balance,
      originalPrice: billing.originalPrice || 0,
      discountType: billing.discountType || "none",
      discountPercentage: billing.discountPercentage || 0,
      deposit: billing.deposit || 0,
      yve: billing.yve || 0,
      modeOfPayment: billing.modeOfPayment || "",
      eventName: billing.booking?.eventName || "Unknown Event",
      clientName,
      bookingId: billing.booking?.id || null,
      status: billing.status || 0,
      payments: billing.payments || [],
      catering: billing.catering || null,
      cateringPerPaxAmount: billing.cateringPerPaxAmount || null,
      isDefault: false,
    };
  } catch (error) {
    console.error("Failed to fetch billing summary", error);
    // Return default values on error instead of throwing
    return {
      totalBilling: 0,
      totalPaid: 0,
      balance: 0,
      originalPrice: 0,
      discountType: "none",
      discountPercentage: 0,
      deposit: 0,
      yve: 0,
      modeOfPayment: "",
      eventName: "Unknown Event",
      clientName: "Unknown Client",
      bookingId: null,
      status: 0,
      payments: [],
      catering: null,
      cateringPerPaxAmount: null,
      isDefault: true,
      error: true,
    };
  }
}
