"use server";

import { prisma } from "../db";

export async function getDocumentsByBooking(bookingId: number) {
  try {
    const documents = await prisma.scannedDocument.findMany({
      where: { bookingId },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents by booking:", error);
    return [];
  }
}

export async function getDocumentsByClient(clientId: number) {
  try {
    const documents = await prisma.scannedDocument.findMany({
      where: { clientId },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents by client:", error);
    return [];
  }
}

export async function getDocumentsByPayment(paymentId: number) {
  try {
    const documents = await prisma.scannedDocument.findMany({
      where: { paymentId },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents by payment:", error);
    return [];
  }
}

export async function getDocumentCategories() {
  try {
    const categories = await prisma.scannedDocumentCategory.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return [];
  }
}
