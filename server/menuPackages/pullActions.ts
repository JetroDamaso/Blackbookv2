"use server";

import { prisma } from "@/server/db";

export async function getAllMenuPackages() {
  try {
    const menuPackages = await prisma.menuPackages.findMany({
      where: {
        isDeleted: false,
        isActive: true,
      },
      include: {
        allowedCategories: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return menuPackages;
  } catch (error) {
    console.error("Error fetching menu packages:", error);
    return [];
  }
}

export async function getMenuPackageById(id: number) {
  try {
    const menuPackage = await prisma.menuPackages.findUnique({
      where: { id },
      include: {
        allowedCategories: true,
      },
    });
    return menuPackage;
  } catch (error) {
    console.error("Error fetching menu package:", error);
    return null;
  }
}
