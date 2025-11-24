"use server";

import { prisma } from "@/server/db";

export async function createRole(data: { name: string }) {
  try {
    const role = await prisma.role.create({
      data: {
        name: data.name,
      },
    });

    return role;
  } catch (error: any) {
    throw new Error("Failed to create role: " + error.message);
  }
}

export async function deleteRole(id: number) {
  try {
    const data = await prisma.role.update({
      where: { id },
      data: { isDeleted: true },
    });
    return data;
  } catch (error: any) {
    throw new Error("Failed to delete role: " + error.message);
  }
}

export async function updateRole(id: number, name: string) {
  try {
    const data = await prisma.role.update({
      where: { id },
      data: { name },
    });
    return data;
  } catch (error: any) {
    throw new Error("Failed to update role: " + error.message);
  }
}
