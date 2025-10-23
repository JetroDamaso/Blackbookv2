import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      employeeId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    employeeId: string;
  }
}
