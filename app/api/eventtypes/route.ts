import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const eventTypes = await prisma.eventTypes.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(eventTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching event types:", error);
    return NextResponse.json({ error: "Failed to fetch event types" }, { status: 500 });
  }
}
