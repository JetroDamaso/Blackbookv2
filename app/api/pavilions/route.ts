import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const pavilions = await prisma.pavilion.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(pavilions, { status: 200 });
  } catch (error) {
    console.error("Error fetching pavilions:", error);
    return NextResponse.json({ error: "Failed to fetch pavilions" }, { status: 500 });
  }
}
