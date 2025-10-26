/**
 * Reject Discount Request API
 * PATCH - Reject a discount request (Owner only)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { prisma } from "@/server/db";
import { logActivity, getIpAddress, getUserAgent } from "@/lib/activity-log";
import { notifyDiscountRejected } from "@/lib/notifications";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - only Owner can reject
    if (!hasPermission(session.user.role as Role, "discounts:reject")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { reviewNotes } = body;

    // Get discount request
    const discountRequest = await prisma.discountRequest.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!discountRequest) {
      return NextResponse.json({ error: "Discount request not found" }, { status: 404 });
    }

    // Check if already reviewed
    if (discountRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Discount request already reviewed" }, { status: 400 });
    }

    // Update discount request
    const updated = await prisma.discountRequest.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "Discount request rejected",
      },
      include: {
        requestedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "discount.rejected",
      resource: "discount",
      resourceId: params.id,
      details: {
        bookingId: discountRequest.bookingId,
        discountValue: discountRequest.discountValue,
        discountUnit: discountRequest.discountUnit,
        reviewNotes: reviewNotes || "Discount request rejected",
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    // Notify requester
    const discountAmount =
      discountRequest.discountUnit === "PERCENTAGE"
        ? `${discountRequest.discountValue}%`
        : `₱${discountRequest.discountValue.toFixed(2)}`;

    await notifyDiscountRejected(
      discountRequest.requestedById,
      params.id,
      discountRequest.bookingId,
      discountAmount,
      reviewNotes
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error rejecting discount request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
