import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// GET - Fetch all saved reports
export async function GET() {
  try {
    const reports = await prisma.generatedReport.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    return NextResponse.json({ error: "Failed to fetch saved reports" }, { status: 500 });
  }
}

// POST - Save a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, reportType, parameters, reportData, generatedBy } = body;

    if (!name || !reportType || !reportData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const savedReport = await prisma.generatedReport.create({
      data: {
        name,
        reportType,
        parameters: JSON.stringify(parameters || {}),
        reportData: JSON.stringify(reportData),
        generatedBy: generatedBy || null,
      },
    });

    return NextResponse.json(savedReport);
  } catch (error) {
    console.error("Error saving report:", error);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}

// DELETE - Delete a saved report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    await prisma.generatedReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
