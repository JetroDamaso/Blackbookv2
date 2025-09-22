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
  }
}
