import { NextRequest, NextResponse } from "next/server";
import { createScannedDocument } from "@/server/Documents/pushActions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received create document request:", body);
    const { name, file, bookingId, clientId, paymentId } = body;

    if (!name || !file) {
      console.error("Missing required fields - name:", name, "file:", file);
      return NextResponse.json({ error: "Name and file path are required" }, { status: 400 });
    }

    console.log("Creating document with data:", {
      name,
      file,
      bookingId: bookingId ? Number(bookingId) : undefined,
      clientId: clientId ? Number(clientId) : undefined,
      paymentId: paymentId ? Number(paymentId) : undefined,
    });

    const result = await createScannedDocument({
      name,
      file,
      bookingId: bookingId ? Number(bookingId) : undefined,
      clientId: clientId ? Number(clientId) : undefined,
      paymentId: paymentId ? Number(paymentId) : undefined,
    });

    console.log("createScannedDocument result:", result);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      console.error("Failed to create document:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in create document API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
