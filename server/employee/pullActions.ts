"use server";
import { prisma } from "../db";

export async function getAllEmployees() {
  try {
    const data = await prisma.employee.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all employees", error);
    throw error;
  }
}

export async function getEmployeeById(id: number) {
  try {
    const data = await prisma.employee.findUnique({
      where: { id },
      include: {
        role: true,
        historyLogs: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch employee", error);
    throw error;
  }
}
