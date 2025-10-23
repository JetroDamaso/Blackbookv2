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

export async function getAllPavilionsPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;
    const totalCount = await prisma.pavilion.count();
    const data = await prisma.pavilion.findMany({
      skip,
      take: pageSize,
      orderBy: { maxPax: "desc" },
    });
    return {
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch paginated pavilions", error);
    throw error;
  }
}
