"use server";
import { prisma } from "../db";

export async function getAllRoles() {
  try {
    const data = await prisma.role.findMany({
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all roles", error);
    throw error;
  }
}

export async function getRoleById(id: number) {
  try {
    const data = await prisma.role.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch role", error);
    throw error;
  }
}
