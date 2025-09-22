import { prisma } from "../db";

export async function getAllServices() {
  try {
    const data = await prisma.otherService.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch services", error);
    throw error;
  }
}

export async function getServicesCategory() {
  try {
    const data = await prisma.otherServiceCategory.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch services", error);
    throw error;
  }
}

export async function getServicesByCategory(categoryId: number) {
  try {
    const data = await prisma.otherService.findMany({
      where: {
        categoryId: categoryId,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch services", error);
    throw error;
  }
}

export async function getIdByServices(services: number) {
  try {
    const data = await prisma.otherService.findMany({
      where: {
        id: services,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch services", error);
    throw error;
  }
}
