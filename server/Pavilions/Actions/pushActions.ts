"use server";
import { prisma } from "../../db";

/**
 * Creates a new pavilion in the database.
 * @param name - The name of the pavilion.
 * @param maxPax - The maximum capacity of the pavilion.
 * @param description - The description of the pavilion.
 * @param color - The color associated with the pavilion (optional).
 * @returns An object with success status and the created pavilion or error message.
 */
export async function createPavilion(
  name: string,
  maxPax: number,
  description: string,
  color?: string | null
) {
  console.log("createPavilion called", { name, maxPax, description, color });
  if (typeof maxPax !== "number" || isNaN(maxPax) || maxPax <= 0) {
    return { success: false, error: "Max capacity must be a positive number." };
  }
  try {
    const pavilion = await prisma.pavilion.create({
      data: {
        name,
        maxPax,
        description,
        color,
        price: 0, // Default price to 0 since we're not using it
      },
    });
    console.log("createPavilion success", pavilion);
    return { success: true, data: pavilion };
  } catch (error: any) {
    // Prisma unique constraint error code for SQLite and Postgres
    if (error.code === "P2002") {
      console.error("createPavilion error: Pavilion name already exists.");
      return { success: false, error: "Pavilion name already exists." };
    }
    console.error("Failed to create pavilion", error);
    return { success: false, error: error?.message || "Failed to create pavilion" };
  }
}

/**
 * Soft deletes a pavilion by setting isDeleted to true.
 * @param id - The ID of the pavilion to delete.
 * @returns An object with success status and the deleted pavilion or error message.
 */
export async function deletePavilion(id: number) {
  try {
    const pavilion = await prisma.pavilion.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { success: true, data: pavilion };
  } catch (error: any) {
    console.error("Failed to delete pavilion", error);
    return { success: false, error: error?.message || "Failed to delete pavilion" };
  }
}

/**
 * Updates an existing pavilion in the database.
 * @param id - The ID of the pavilion to update.
 * @param name - The name of the pavilion.
 * @param maxPax - The maximum capacity of the pavilion.
 * @param description - The description of the pavilion.
 * @param color - The color associated with the pavilion (optional).
 * @returns An object with success status and the updated pavilion or error message.
 */
export async function updatePavilion(
  id: number,
  name: string,
  maxPax: number,
  description: string,
  color?: string | null
) {
  console.log("updatePavilion called", { id, name, maxPax, description, color });
  if (typeof maxPax !== "number" || isNaN(maxPax) || maxPax <= 0) {
    return { success: false, error: "Max capacity must be a positive number." };
  }
  try {
    const pavilion = await prisma.pavilion.update({
      where: { id },
      data: {
        name,
        maxPax,
        description,
        color,
      },
    });
    console.log("updatePavilion success", pavilion);
    return { success: true, data: pavilion };
  } catch (error: any) {
    // Prisma unique constraint error code for SQLite and Postgres
    if (error.code === "P2002") {
      console.error("updatePavilion error: Pavilion name already exists.");
      return { success: false, error: "Pavilion name already exists." };
    }
    console.error("Failed to update pavilion", error);
    return { success: false, error: error?.message || "Failed to update pavilion" };
  }
}
