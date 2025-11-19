import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { updateBookingStatus } from "@/server/Booking/pushActions";

export async function POST(request: NextRequest) {
  try {
    const { billingId, reason, refundAmount, isFullRefund } = await request.json();

    if (!billingId || !reason) {
      return NextResponse.json(
        { message: "Billing ID and reason are required" },
        { status: 400 }
      );
    }

    // Fetch the billing with all payments and booking
    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
      include: {
        payments: {
          where: {
            status: { not: "refunded" }
          }
        },
        booking: true,
      },
    });

    if (!billing) {
      return NextResponse.json(
        { message: "Billing not found" },
        { status: 404 }
      );
    }

    if (billing.payments.length === 0) {
      return NextResponse.json(
        { message: "No payments found to refund" },
        { status: 404 }
      );
    }

    if (isFullRefund) {
      // Full refund - mark all payments as refunded
      const refundDate = new Date();
      const formattedDate = refundDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      await Promise.all(
        billing.payments.map((payment) =>
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "refunded",
              notes: `REFUNDED on ${formattedDate} - Reason: ${reason}`,
            },
          })
        )
      );
    } else {
      // Partial refund - create a negative payment record
      if (!refundAmount || refundAmount <= 0) {
        return NextResponse.json(
          { message: "Valid refund amount is required for partial refund" },
          { status: 400 }
        );
      }

      const totalPaymentAmount = billing.payments.reduce((sum, p) => sum + p.amount, 0);

      if (refundAmount > totalPaymentAmount) {
        return NextResponse.json(
          { message: "Refund amount cannot exceed total payment amount" },
          { status: 400 }
        );
      }

      const refundDate = new Date();
      const formattedDate = refundDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      await prisma.payment.create({
        data: {
          billingId: billing.id,
          clientId: billing.payments[0]?.clientId || null,
          amount: -Math.abs(refundAmount),
          date: new Date(),
          status: "refund",
          notes: `Partial refund on ${formattedDate} - Reason: ${reason}`,
          orNumber: null,
        },
      });
    }

    // Update booking status if billing has a booking
    if (billing.booking?.id) {
      await updateBookingStatus(billing.booking.id);
    }

    return NextResponse.json({
      success: true,
      message: isFullRefund
        ? "All payments refunded successfully"
        : `Partial refund of ₱${refundAmount.toFixed(2)} processed successfully`,
    });
  } catch (error: any) {
    console.error("Error refunding payment:", error);
    return NextResponse.json(
      { message: error.message || "Failed to refund payment" },
      { status: 500 }
    );
  }
}
