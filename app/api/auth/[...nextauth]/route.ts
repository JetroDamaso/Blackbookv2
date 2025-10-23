import { authenticateEmployee } from "@/server/employee/pullActions";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        employeeId: {
          label: "Employee ID",
          type: "text",
          placeholder: "Enter your employee ID",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.employeeId || !credentials?.password) {
          return null;
        }

        try {
          const employee = await authenticateEmployee(credentials.employeeId, credentials.password);

          if (!employee) {
            return null;
          }

          // Return user object that will be saved in the JWT
          return {
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            email: `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@company.com`,
            role: employee.role?.name || "Employee",
            employeeId: employee.id,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.employeeId = user.employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || "";
        session.user.role = (token.role as string) || "";
        session.user.employeeId = (token.employeeId as string) || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
