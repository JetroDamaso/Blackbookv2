/**
 * Unread Notification Count API
 * GET - Get count of unread notifications
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/server/db";
import { getUnreadNotificationCount } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role to filter REFUND notifications
    const employee = await prisma.employee.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    const isManagerOrOwner =
      employee?.role?.name === "Manager" ||
      employee?.role?.name === "Owner";

    // Get base unread count
    let count = await getUnreadNotificationCount(session.user.id);

    // If not manager or owner, subtract REFUND notifications from count
    if (!isManagerOrOwner) {
      const refundNotificationCount = await prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false,
          type: "REFUND",
        },
      });
      count = Math.max(0, count - refundNotificationCount);
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
