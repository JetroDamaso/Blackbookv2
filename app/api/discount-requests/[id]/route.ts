/**
 * Discount Request Detail API
 * GET - Get discount request details
 * PATCH - Update discount request
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { prisma } from "@/server/db";

/**
 * Get discount request details
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discountRequest = await prisma.discountRequest.findUnique({
      where: { id: params.id },
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
          include: {
            client: true,
            pavilion: true,
            category: true,
            package: true,
          },
        },
      },
    });

    if (!discountRequest) {
      return NextResponse.json({ error: "Discount request not found" }, { status: 404 });
    }

    // Check permission - Owner can see all, others can only see their own
    const canViewAll = hasPermission(session.user.role as Role, "discounts:approve");
    if (!canViewAll && discountRequest.requestedById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse documents JSON
    const parsedRequest = {
      ...discountRequest,
      documents: discountRequest.documents ? JSON.parse(discountRequest.documents) : [],
    };

    return NextResponse.json(parsedRequest);
  } catch (error) {
    console.error("Error fetching discount request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
