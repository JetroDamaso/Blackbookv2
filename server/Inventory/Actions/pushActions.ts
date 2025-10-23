"use server";
import { prisma } from "@/server/db";

export async function createInventoryStatus(
  inventoryId: number,
  pavilionId: number | null,
  bookingId: number,
  quantity: number
) {
  try {
    if (!inventoryId || !bookingId || quantity <= 0) {
      throw new Error("Invalid parameters for inventory status creation");
    }

    const data = await prisma.inventoryStatus.create({
      data: {
        inventoryId,
        pavilionId,
        bookingId,
        quantity,
      },
    });

    return data;
  } catch (error) {
    console.error("Failed to create inventory status", error);
    throw error;
  }
}

export async function updateInventoryStatus(
  id: number,
  inventoryId?: number,
  pavilionId?: number,
  bookingId?: number,
  quantity?: number
) {
  try {
    const updateData: any = {};

    if (inventoryId !== undefined) updateData.inventoryId = inventoryId;
    if (pavilionId !== undefined) updateData.pavilionId = pavilionId;
    if (bookingId !== undefined) updateData.bookingId = bookingId;
    if (quantity !== undefined) updateData.quantity = quantity;

    const data = await prisma.inventoryStatus.update({
      where: { id },
      data: updateData,
    });

    return data;
  } catch (error) {
    console.error("Failed to update inventory status", error);
    throw error;
  }
}

export async function deleteInventoryStatus(id: number) {
  try {
    const data = await prisma.inventoryStatus.delete({
      where: { id },
    });

    return data;
  } catch (error) {
    console.error("Failed to delete inventory status", error);
    throw error;
  }
}

export async function createInventoryItem(
  name: string,
  categoryId: number | null,
  quantity: number
) {
  try {
    if (!name || quantity < 0) {
      throw new Error("Invalid parameters for inventory item creation");
    }

    const data = await prisma.inventoryItem.create({
      data: {
        name,
        categoryId,
        quantity,
        out: 0,
      },
      include: {
        category: true,
      },
    });

    return data;
  } catch (error) {
    console.error("Failed to create inventory item", error);
    throw error;
  }
}

export async function updateInventoryItem(
  id: number,
  name?: string,
  categoryId?: number | null,
  quantity?: number,
  out?: number
) {
  try {
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (out !== undefined) updateData.out = out;

    const data = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return data;
  } catch (error) {
    console.error("Failed to update inventory item", error);
    throw error;
  }
}

export async function deleteInventoryItem(id: number) {
  try {
    const data = await prisma.inventoryItem.delete({
      where: { id },
    });

    return data;
  } catch (error) {
    console.error("Failed to delete inventory item", error);
    throw error;
  }
}
