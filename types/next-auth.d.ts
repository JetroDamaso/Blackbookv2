import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    employeeNumber?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      employeeId: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      employeeNumber?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    employeeId: string;
  }
}
