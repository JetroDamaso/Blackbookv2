"use server";

import { prisma } from "../db";

export async function createClient(
  firstName: string,
  lastName: string,
  region: string,
  province: string,
  municipality: string,
  barangay: string,
  phoneNumber: string,
  email: string
) {
  try {
    const data = await prisma.client.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        region: region,
        province: province,
        municipality: municipality,
        barangay: barangay,
        phoneNumber: phoneNumber,
        email: email,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
}

export async function deleteClient(id: number) {
  try {
    const data = await prisma.client.update({
      where: { id },
      data: { isDeleted: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to delete client:", error);
    throw error;
  }
}
export async function updateClient(
  clientId: number,
  firstName?: string,
  lastName?: string,
  region?: string,
  province?: string,
  municipality?: string,
  barangay?: string,
  phoneNumber?: string,
  email?: string
) {
  try {
    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (region !== undefined) updateData.region = region;
    if (province !== undefined) updateData.province = province;
    if (municipality !== undefined) updateData.municipality = municipality;
    if (barangay !== undefined) updateData.barangay = barangay;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) updateData.email = email;

    const data = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
    });
    return data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
}
