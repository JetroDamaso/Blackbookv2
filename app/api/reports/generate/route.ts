/**
 * API Route: Generate Report
 * POST /api/reports/generate
 */

import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/reports/generate";
import { validateReportParams } from "@/lib/reports/utils";
import type { ReportParams } from "@/lib/reports/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse dates from strings if necessary
    const params: ReportParams = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    // Validate parameters
    const validation = validateReportParams(params);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate report
    const report = await generateReport(params);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
