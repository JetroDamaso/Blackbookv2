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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = session.user.role?.toUpperCase().replace(/\s+/g, "_");
    if (userRole !== "OWNER" && userRole !== "MANAGER") {
      return NextResponse.json(
        { error: "Forbidden: Only Owner and Manager can restore database" },
        { status: 403 }
      );
    }

    const { fileData, fileName } = await request.json();

    if (!fileData) {
      return NextResponse.json(
        { error: "File data is required" },
        { status: 400 }
      );
    }

    // Get the current database path
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");

    // Create a backup of the current database before restoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const autoBackupPath = path.join(process.cwd(), "prisma", `auto-backup-${timestamp}.db`);
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, autoBackupPath);
    }

    // Convert base64 to buffer and write to database file
    const base64Data = fileData.split(',')[1]; // Remove data:application/x-sqlite3;base64, prefix
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({
      success: true,
      message: "Database restored successfully",
      autoBackupPath,
      restoredFrom: fileName,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore database", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
