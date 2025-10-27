"use server";
import { prisma } from "../db";

export async function createEmployee(data: {
  empId: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId?: number;
  dateOfEmployment: Date;
}) {
  try {
    const employee = await prisma.employee.create({
      data: {
        empId: data.empId,
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

export async function updateEmployeeProfile(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }
) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return employee;
  } catch (error) {
    console.error("Failed to update employee profile", error);
    throw error;
  }
}

export async function updateEmployeePassword(id: string, newPassword: string) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });
    return employee;
  } catch (error) {
    console.error("Failed to update employee password", error);
    throw error;
  }
}
