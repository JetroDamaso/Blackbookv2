/**
 * Notifications API
 * GET - Get user's notifications
 * PATCH - Mark notifications as read
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/server/db";
import {
  getUserNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";

/**
 * Get user's notifications
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    console.log("Fetching notifications for userId:", session.user.id);
    console.log("Parameters:", { limit, offset, unreadOnly });

    const result = await getUserNotifications(session.user.id, {
      limit,
      offset,
      unreadOnly,
    });

    // Check user role to filter REFUND notifications
    const employee = await prisma.employee.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    const isManagerOrOwner =
      employee?.role?.name === "Manager" ||
      employee?.role?.name === "Owner";

    // Filter out REFUND notifications for non-manager/owner users
    if (!isManagerOrOwner) {
      result.notifications = result.notifications.filter(
        (n: any) => n.type !== "REFUND"
      );
    }

    console.log("Notifications result:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Mark notifications as read
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead(session.user.id);
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await markNotificationsAsRead(notificationIds);
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
