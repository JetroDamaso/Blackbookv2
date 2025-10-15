"use server";
import { prisma } from "../db";

export async function createEmployee(data: {
  firstName: string;
  lastName: string;
  password: string;
  roleId?: number;
  dateOfEmployment: Date;
}) {
  try {
    const employee = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        roleId: data.roleId,
        dateOfEmployment: data.dateOfEmployment,
      },
    });
    return employee;
  } catch (error) {
    console.error("Failed to create employee", error);
    throw error;
  }
}
