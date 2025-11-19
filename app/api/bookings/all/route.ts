/**
 * API Route: Get All Bookings (for report selection)
 * GET /api/bookings/all
 */

import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        eventName: true,
        startAt: true,
        endAt: true,
        status: true,
        clientId: true,
        pavilionId: true,
        createdAt: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        pavilion: {
          select: {
            name: true,
          },
        },
        billing: {
          select: {
            balance: true,
            originalPrice: true,
            status: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
