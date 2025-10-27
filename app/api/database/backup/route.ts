import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role?.toUpperCase().replace(/\s+/g, "_");
    if (userRole !== "OWNER" && userRole !== "MANAGER") {
      return NextResponse.json(
        { error: "Forbidden: Only Owner and Manager can backup database" },
        { status: 403 }
      );
    }

    // Get the current database path
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");

    // Check if source database exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found" }, { status: 404 });
    }

    // Read the database file
    const fileBuffer = fs.readFileSync(dbPath);

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.db`;

    // Return the file as a download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="${backupFileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      {
        error: "Failed to create backup",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
