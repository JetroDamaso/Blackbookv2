"use server";

import { prisma } from "../db";

export async function createScannedDocument(data: {
  name: string;
  file: string;
  bookingId?: number;
  clientId?: number;
  paymentId?: number;
}) {
  try {
    console.log("Creating scanned document in database with data:", data);
    const document = await prisma.scannedDocument.create({
      data: {
        name: data.name,
        file: data.file,
        bookingId: data.bookingId,
        clientId: data.clientId,
        paymentId: data.paymentId,
      },
    });
    console.log("Document created successfully:", document);
    return { success: true, document };
  } catch (error) {
    console.error("Error creating scanned document - Full error:", error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create document",
      details: error instanceof Error ? error.stack : String(error),
    };
  }
}

export async function deleteScannedDocument(id: number) {
  try {
    await prisma.scannedDocument.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting scanned document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}
