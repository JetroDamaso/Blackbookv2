"use server";
import { prisma } from "../db";

export async function getMenuByBookingId(bookingId: number) {
  try {
    const data = await prisma.menu.findMany({
      where: { bookingId },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch menu by booking id", error);
    throw error;
  }
}

export async function getMenuWithDishesByBookingId(bookingId: number) {
  try {
    const data = await prisma.menu.findMany({
      where: { bookingId },
      include: { menuDishes: { include: { dish: true } } },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch menu with dishes by booking id", error);
    throw error;
  }
}

export async function getDishesByMenuId(menuId: number) {
  try {
    const rows = await prisma.menuDish.findMany({
      where: { menuId },
      include: { dish: { include: { category: true } } },
    });
    return rows.map((r) => ({
      id: r.dish.id,
      name: r.dish.name,
      categoryName: r.dish.category?.name,
      quantity: r.quantity,
    }));
  } catch (error) {
    console.error("Failed to fetch dishes by menu id", error);
    throw error;
  }
}

export async function getDishesById(id: number) {
  try {
    const data = await prisma.dish.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch dish by id", error);
    throw error;
  }
}
