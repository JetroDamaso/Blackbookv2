/**
 * Notification Detail API
 * DELETE - Delete a notification
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { deleteNotification } from "@/lib/notifications";
import { prisma } from "@/server/db";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteNotification(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
