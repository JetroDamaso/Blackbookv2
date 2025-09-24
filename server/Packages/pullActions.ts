"use server";
import { prisma } from "../db";

export async function getAllPackages() {
  try {
    const data = await prisma.package.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch packages", error);
    throw error;
  }
}

export async function getPackagesById(id: number) {
  try {
    const data = await prisma.package.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch packages", error);
    throw error;
  }
}
