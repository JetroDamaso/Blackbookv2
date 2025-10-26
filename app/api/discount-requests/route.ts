/**
 * Discount Requests API
 * POST - Create new discount request
 * GET - List discount requests (filtered by role)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { prisma } from "@/server/db";
import { logActivity, getIpAddress, getUserAgent } from "@/lib/activity-log";
import { notifyDiscountRequest } from "@/lib/notifications";

/**
 * Create a new discount request
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role as Role, "discounts:request")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      bookingId,
      discountType,
      discountValue,
      discountUnit,
      justification,
      documents,
      originalAmount,
    } = body;

    // Validate required fields
    if (
      !bookingId ||
      !discountType ||
      !discountValue ||
      !discountUnit ||
      !justification ||
      !originalAmount
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Calculate final amount
    let finalAmount = originalAmount;
    if (discountUnit === "PERCENTAGE") {
      finalAmount = originalAmount - (originalAmount * discountValue) / 100;
    } else {
      finalAmount = originalAmount - discountValue;
    }

    // Create discount request
    const discountRequest = await prisma.discountRequest.create({
      data: {
        bookingId,
        requestedById: session.user.id,
        discountType,
        discountValue,
        discountUnit,
        justification,
        documents: documents ? JSON.stringify(documents) : null,
        status: "PENDING",
        originalAmount,
        finalAmount,
      },
      include: {
        requestedBy: {
          select: {
            firstName: true,
            lastName: true,
            roleId: true,
          },
        },
        booking: {
          select: {
            id: true,
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

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "discount.requested",
      resource: "discount",
      resourceId: discountRequest.id,
      details: {
        bookingId,
        discountValue,
        discountUnit,
        originalAmount,
        finalAmount,
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    // Find Owner to notify
    const owner = await prisma.employee.findFirst({
      where: {
        role: {
          name: "Owner",
        },
      },
    });

    if (owner) {
      const requesterName = `${discountRequest.requestedBy.firstName} ${discountRequest.requestedBy.lastName}`;
      const discountAmount =
        discountUnit === "PERCENTAGE" ? `${discountValue}%` : `₱${discountValue.toFixed(2)}`;

      await notifyDiscountRequest(
        owner.id,
        discountRequest.id,
        requesterName,
        bookingId,
        discountAmount
      );
    }

    return NextResponse.json(discountRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating discount request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * List discount requests (filtered by role)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role as Role, "discounts:view-all")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = {};

    // If not Owner, only show user's own requests
    if (!hasPermission(session.user.role as Role, "discounts:approve")) {
      where.requestedById = session.user.id;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Get discount requests
    const [discountRequests, total] = await Promise.all([
      prisma.discountRequest.findMany({
        where,
        orderBy: { requestedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          requestedBy: {
            select: {
              firstName: true,
              lastName: true,
              roleId: true,
            },
          },
          reviewedBy: {
            select: {
              firstName: true,
              lastName: true,
              roleId: true,
            },
          },
          booking: {
            select: {
              id: true,
              eventDate: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.discountRequest.count({ where }),
    ]);

    // Parse documents JSON
    const parsedRequests = discountRequests.map(req => ({
      ...req,
      documents: req.documents ? JSON.parse(req.documents) : [],
    }));

    return NextResponse.json({
      discountRequests: parsedRequests,
      total,
      hasMore: total > offset + limit,
    });
  } catch (error) {
    console.error("Error fetching discount requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
