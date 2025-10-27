"use server";
import "server-only";
import { prisma } from "../../db";

export async function createDish(
  name: string,
  categoryId: number,
  description?: string,
  allergens?: string
) {
  try {
    const dish = await prisma.dish.create({
      data: {
        name,
        categoryId,
        description,
        allergens,
      },
      include: {
        category: true,
      },
    });
    return dish;
  } catch (error) {
    console.error("Failed to create dish", error);
    throw error;
  }
}

export async function updateDish(
  dishId: number,
  name: string,
  categoryId: number,
  description?: string,
  allergens?: string
) {
  try {
    const dish = await prisma.dish.update({
      where: { id: dishId },
      data: {
        name,
        categoryId,
        description,
        allergens,
      },
      include: {
        category: true,
      },
    });
    return dish;
  } catch (error) {
    console.error("Failed to update dish", error);
    throw error;
  }
}

export async function deleteDish(dishId: number) {
  try {
    // Soft delete: set isDeleted to true instead of hard deleting
    // The dish will still be available in existing menus, but won't show in the dish list
    const dish = await prisma.dish.update({
      where: { id: dishId },
      data: { isDeleted: true },
    });
    return dish;
  } catch (error) {
    console.error("Failed to delete dish", error);
    throw error;
  }
}

export async function addDishToMenu(menuId: number, dishId: number, quantity: number = 1) {
  try {
    const existing = await prisma.menuDish.findUnique({
      where: { menuId_dishId: { menuId, dishId } },
    });

    if (existing) {
      // Update quantity if dish already exists in menu
      const updated = await prisma.menuDish.update({
        where: { menuId_dishId: { menuId, dishId } },
        data: { quantity: existing.quantity + quantity },
      });
      return updated;
    } else {
      // Create new menu dish entry
      const menuDish = await prisma.menuDish.create({
        data: {
          menuId,
          dishId,
          quantity,
        },
      });
      return menuDish;
    }
  } catch (error) {
    console.error("Failed to add dish to menu", error);
    throw error;
  }
}

export async function removeDishFromMenu(menuId: number, dishId: number, quantity?: number) {
  try {
    const existing = await prisma.menuDish.findUnique({
      where: { menuId_dishId: { menuId, dishId } },
    });

    if (!existing) {
      throw new Error("Dish not found in menu");
    }

    if (quantity && existing.quantity > quantity) {
      // Reduce quantity
      const updated = await prisma.menuDish.update({
        where: { menuId_dishId: { menuId, dishId } },
        data: { quantity: existing.quantity - quantity },
      });
      return updated;
    } else {
      // Remove dish completely from menu
      const deleted = await prisma.menuDish.delete({
        where: { menuId_dishId: { menuId, dishId } },
      });
      return deleted;
    }
  } catch (error) {
    console.error("Failed to remove dish from menu", error);
    throw error;
  }
}

export async function updateMenuDishQuantity(menuId: number, dishId: number, quantity: number) {
  try {
    if (quantity <= 0) {
      // Remove dish if quantity is 0 or negative
      return await removeDishFromMenu(menuId, dishId);
    }

    const updated = await prisma.menuDish.upsert({
      where: { menuId_dishId: { menuId, dishId } },
      update: { quantity },
      create: { menuId, dishId, quantity },
    });
    return updated;
  } catch (error) {
    console.error("Failed to update menu dish quantity", error);
    throw error;
  }
}
