/**
 * Modify Discount Request API
 * PATCH - Modify and approve a discount request (Owner only)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { prisma } from "@/server/db";
import { logActivity, getIpAddress, getUserAgent } from "@/lib/activity-log";
import { notifyDiscountModified } from "@/lib/notifications";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - only Owner can modify
    if (!hasPermission(session.user.role as Role, "discounts:approve")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { modifiedDiscountValue, modifiedDiscountUnit, reviewNotes } = body;

    // Validate required fields
    if (!modifiedDiscountValue || !modifiedDiscountUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    // Calculate new final amount
    let newFinalAmount = discountRequest.originalAmount || 0;
    if (modifiedDiscountUnit === "PERCENTAGE") {
      newFinalAmount =
        (discountRequest.originalAmount || 0) -
        ((discountRequest.originalAmount || 0) * modifiedDiscountValue) / 100;
    } else {
      newFinalAmount = (discountRequest.originalAmount || 0) - modifiedDiscountValue;
    }

    // Update discount request
    const updated = await prisma.discountRequest.update({
      where: { id: params.id },
      data: {
        status: "MODIFIED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        reviewNotes:
          reviewNotes ||
          `Modified discount to ${modifiedDiscountValue}${modifiedDiscountUnit === "PERCENTAGE" ? "%" : " pesos"}`,
        discountValue: modifiedDiscountValue,
        discountUnit: modifiedDiscountUnit,
        finalAmount: newFinalAmount,
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
      action: "discount.modified",
      resource: "discount",
      resourceId: params.id,
      details: {
        bookingId: discountRequest.bookingId,
        originalDiscountValue: discountRequest.discountValue,
        modifiedDiscountValue,
        originalDiscountUnit: discountRequest.discountUnit,
        modifiedDiscountUnit,
        originalFinalAmount: discountRequest.finalAmount,
        newFinalAmount,
        reviewNotes,
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    // Notify requester
    const originalAmount =
      discountRequest.discountUnit === "PERCENTAGE"
        ? `${discountRequest.discountValue}%`
        : `₱${discountRequest.discountValue.toFixed(2)}`;

    const modifiedAmount =
      modifiedDiscountUnit === "PERCENTAGE"
        ? `${modifiedDiscountValue}%`
        : `₱${modifiedDiscountValue.toFixed(2)}`;

    await notifyDiscountModified(
      discountRequest.requestedById,
      params.id,
      discountRequest.bookingId,
      originalAmount,
      modifiedAmount
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error modifying discount request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
