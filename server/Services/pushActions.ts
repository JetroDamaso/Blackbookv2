"use server";
import { prisma } from "../db";

export async function createNewService(serviceName: string, categoryId: number) {
  try {
    const data = await prisma.otherService.create({
      data: {
        name: serviceName,
        categoryId: categoryId,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
}

export async function updateService(serviceId: number, serviceName: string, categoryId: number) {
  try {
    const data = await prisma.otherService.update({
      where: { id: serviceId },
      data: {
        name: serviceName,
        categoryId: categoryId,
      },
    });
    return data;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

export async function deleteService(serviceId: number) {
  try {
    const data = await prisma.otherService.delete({
      where: { id: serviceId },
    });
    return data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
}

export async function addServiceToBooking(bookingId: number, serviceId: number) {
  try {
    const data = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        otherServices: {
          connect: { id: serviceId },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Error adding service to booking:", error);
    throw error;
  }
}

export async function removeServiceFromBooking(bookingId: number, serviceId: number) {
  try {
    const data = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        otherServices: {
          disconnect: { id: serviceId },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Error removing service from booking:", error);
    throw error;
  }
}

export async function createServiceCategory(categoryName: string) {
  try {
    const data = await prisma.otherServiceCategory.create({
      data: {
        name: categoryName,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating service category:", error);
    throw error;
  }
}

export async function updateServiceCategory(categoryId: number, categoryName: string) {
  try {
    const data = await prisma.otherServiceCategory.update({
      where: { id: categoryId },
      data: {
        name: categoryName,
      },
    });
    return data;
  } catch (error) {
    console.error("Error updating service category:", error);
    throw error;
  }
}

export async function deleteServiceCategory(categoryId: number) {
  try {
    const data = await prisma.otherServiceCategory.delete({
      where: { id: categoryId },
    });
    return data;
  } catch (error) {
    console.error("Error deleting service category:", error);
    throw error;
  }
}
