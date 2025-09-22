"use server"
import { prisma } from "../db";

export async function createNewService(
  serviceName: string,
  categoryId: number
) {
  try {
    const data = await prisma.otherService.create({
      data: {
        name: serviceName,
        categoryId: categoryId,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating service:", error);
  }
}
