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
