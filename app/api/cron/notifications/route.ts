import { NextRequest, NextResponse } from "next/server";
import { processPendingNotifications } from "@/lib/notification-scheduler";

/**
 * API endpoint to process pending scheduled notifications
 * For local use - can be called manually or by a scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add basic authentication for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Only check authentication if CRON_SECRET is set
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process all pending notifications
    const result = await processPendingNotifications();

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} notifications`,
      processed: result.processed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in notifications endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
