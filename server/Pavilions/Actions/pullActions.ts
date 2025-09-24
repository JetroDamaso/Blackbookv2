"use server";
import { prisma } from "@/server/db";

export async function getAllPavilions() {
  try {
    const data = await prisma.pavilion.findMany({
      orderBy: { maxPax: "desc" },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch pavilions", error);
    throw error;
  }
}

export async function getPavilionsById(id: number) {
  try {
    const data = await prisma.pavilion.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch pavilions", error);
    throw error;
  }
}
