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
        firstName: "asc",
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all employees", error);
    throw error;
  }
}

export async function getAllEmployeesPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;

    // Get total count for pagination info
    const totalCount = await prisma.employee.count();

    // Get paginated data
    const data = await prisma.employee.findMany({
      skip,
      take: pageSize,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch paginated employees", error);
    throw error;
  }
}

export async function authenticateEmployee(empId: string, password: string) {
  try {
    // Find employee by empId
    const employee = await prisma.employee.findFirst({
      where: {
        empId: empId,
        isActive: true,
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

    if (!employee) {
      return null;
    }

    // Simple password comparison - in production, use bcrypt for hashed passwords
    if (employee.password !== password) {
      return null;
    }

    return {
      id: employee.id as string,
      empId: employee.empId || "",
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      dateOfEmployment: employee.dateOfEmployment,
    };
  } catch (error) {
    console.error("Failed to authenticate employee", error);
    return null;
  }
}

export async function getEmployeeById(id: string) {
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
