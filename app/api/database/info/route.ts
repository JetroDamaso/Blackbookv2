import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
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
        { error: "Forbidden: Only Owner and Manager can view database info" },
        { status: 403 }
      );
    }

    // Get the current database path
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");

    // Check if database exists and get stats
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      
      return NextResponse.json({
        success: true,
        databasePath: dbPath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        lastModified: stats.mtime,
        exists: true,
      });
    } else {
      return NextResponse.json({
        success: true,
        databasePath: dbPath,
        exists: false,
      });
    }
  } catch (error) {
    console.error("Database info error:", error);
    return NextResponse.json(
      { error: "Failed to get database info", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
