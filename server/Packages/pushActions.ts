"use server";
import { prisma } from "../db";

export async function createPackage(
  packageName: string,
  price: number,
  description: string,
  pavilionId: number,
  includePool: boolean
) {
  try {
    const data = await prisma.package.create({
      data: {
        name: packageName,
        price: price,
        description: description,
        pavilionId: pavilionId,
        includePool: includePool,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating package:", error);
  }
}

export async function deletePackage(id: number) {
  try {
    const data = await prisma.package.update({
      where: { id },
      data: { isDeleted: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to delete package", error);
    throw error;
  }
}
