"use server";
import { prisma } from "../db";

export async function createMenu(bookingId: number) {
  try {
    const menu = await prisma.menu.create({
      data: { bookingId },
    });
    return menu;
  } catch (error) {
    console.error("Failed to create menu", error);
    throw error;
  }
}

export async function createMenuWithDishes(bookingId: number, dishIds: number[]) {
  try {
    const counts = dishIds.reduce<Record<number, number>>((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const menu = await prisma.menu.create({
      data: { bookingId },
    });

    if (Object.keys(counts).length) {
      await prisma.menuDish.createMany({
        data: Object.entries(counts).map(([dishId, quantity]) => ({
          menuId: menu.id,
          dishId: Number(dishId),
          quantity,
        })),
      });
    }

    const full = await prisma.menu.findUnique({
      where: { id: menu.id },
      include: { menuDishes: { include: { dish: true } } },
    });
    return full;
  } catch (error) {
    console.error("Failed to create menu", error);
    throw error;
  }
}

export async function addOrIncrementDish(menuId: number, dishId: number, increment: number = 1) {
  try {
    const existing = await prisma.menuDish.findUnique({
      where: { menuId_dishId: { menuId, dishId } },
    });
    if (existing) {
      return await prisma.menuDish.update({
        where: { menuId_dishId: { menuId, dishId } },
        data: { quantity: existing.quantity + increment },
      });
    }
    return await prisma.menuDish.create({
      data: { menuId, dishId, quantity: increment },
    });
  } catch (error) {
    console.error("Failed to add/increment dish", error);
    throw error;
  }
}

export async function updateMenuPackage(menuId: number, menuPackagesId: number | null, pricePerPax?: number | null, isCustom?: boolean) {
  try {
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        menuPackagesId,
        pricePerPax: pricePerPax !== undefined ? pricePerPax : undefined,
        isCustom: isCustom !== undefined ? isCustom : undefined,
      },
    });
    return updatedMenu;
  } catch (error) {
    console.error("Failed to update menu package", error);
    throw error;
  }
}
