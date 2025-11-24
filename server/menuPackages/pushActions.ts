"use server";

import { prisma } from "@/server/db";

export async function createMenuPackage(
  name: string,
  price: number,
  maxDishes: number,
  allowedCategoryIds: number[],
  description?: string
) {
  try {
    const menuPackage = await prisma.menuPackages.create({
      data: {
        name,
        price,
        maxDishes,
        description,
        isActive: true,
        isDeleted: false,
        allowedCategories: {
          connect: allowedCategoryIds.map(id => ({ id })),
        },
      },
      include: {
        allowedCategories: true,
      },
    });
    return menuPackage;
  } catch (error) {
    console.error("Error creating menu package:", error);
    throw error;
  }
}

export async function updateMenuPackage(
  id: number,
  name: string,
  price: number,
  maxDishes: number,
  allowedCategoryIds: number[],
  description?: string
) {
  try {
    const menuPackage = await prisma.menuPackages.update({
      where: { id },
      data: {
        name,
        price,
        maxDishes,
        description,
        allowedCategories: {
          set: [],
          connect: allowedCategoryIds.map(id => ({ id })),
        },
      },
      include: {
        allowedCategories: true,
      },
    });
    return menuPackage;
  } catch (error) {
    console.error("Error updating menu package:", error);
    throw error;
  }
}

export async function deleteMenuPackage(id: number) {
  try {
    const menuPackage = await prisma.menuPackages.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
    return menuPackage;
  } catch (error) {
    console.error("Error deleting menu package:", error);
    throw error;
  }
}

export async function toggleMenuPackageActive(id: number, isActive: boolean) {
  try {
    const menuPackage = await prisma.menuPackages.update({
      where: { id },
      data: { isActive },
    });
    return menuPackage;
  } catch (error) {
    console.error("Error toggling menu package active status:", error);
    throw error;
  }
}
