# Authentication System Documentation

## Overview

This application uses NextAuth.js v4 for authentication, integrated with a Prisma-based Employee database. The system authenticates employees using the first 8 characters of their UUID Employee ID and password.

## Features

- **Employee Authentication**: Login using first 8 characters of UUID Employee ID and password
- **Role-based Access**: Users have roles (from the Employee.role relationship)
- **Session Management**: JWT-based sessions with NextAuth
- **Route Protection**: Middleware-based route protection
- **Auto Redirect**: Automatic redirection for authenticated/unauthenticated users
- **UUID-based IDs**: Employee IDs are UUIDs with first 8 characters used for login

## Components

### 1. NextAuth Configuration (`app/api/auth/[...nextauth]/route.ts`)

The main authentication configuration:

- **Provider**: Credentials provider for Employee ID/password authentication
- **Database Integration**: Uses `authenticateEmployee()` function from server actions
- **JWT Callbacks**: Manages user session data (role, employeeId)
- **Session Strategy**: JWT-based sessions

### 2. Database Integration (`server/employee/pullActions.ts`)

**Functions:**

- `getAllEmployees()`: Fetches all employees with role information
- `authenticateEmployee(employeeIdPrefix, password)`: Validates employee credentials using first 8 characters of UUID
- `getEmployeeById(id)`: Fetches specific employee details using full UUID

**Security Note**: Currently uses plain text password comparison. For production, implement bcrypt hashing.

### 3. Login Components

**LoginForm** (`components/login-form.tsx`):

- Card-based login form with validation
- Error handling and loading states
- NextAuth signIn integration
- First 8 characters UUID input

**LoginPage** (`components/login-page.tsx`):

- Full-page login with custom styling
- First 8 characters of UUID Employee ID input
- Password input with validation
- Responsive design with logo

### 4. Authentication Pages

**Login Page** (`app/login/page.tsx`):

- Dedicated login route at `/login`
- Auto-redirect for authenticated users to `/event_calendar`
- Loading states

### 5. Utility Components

**LogoutButton** (`components/logout-button.tsx`):

- Configurable logout button
- Loading states and error handling
- Automatic redirect after logout

**UserInfo** (`components/user-info.tsx`):

- Display current user information
- Shows Employee ID, name, email, and role
- Card and compact variants available

**UserInfoCompact** (`components/user-info.tsx`):

- Compact user display for navigation
- Shows avatar, name, Employee ID, and role badge

### 6. Authentication Hook (`hooks/useAuth.ts`)

**useAuth()**: Basic authentication state

```typescript
const { session, user, isLoading, isAuthenticated, status } = useAuth();
```

**useRequireAuth()**: Auto-redirect for protected routes

```typescript
const { isAuthenticated, isLoading } = useRequireAuth();
```

### 7. Middleware (`middleware.ts`)

**Route Protection**:

- Protects all routes except public ones
- Automatic redirect to `/login` for unauthenticated users
- Excludes static files, images, and API routes

**Protected Routes**: All routes except:

- `/api/auth/*` (NextAuth endpoints)
- `/login` (Login page)
- Static files and images
- `_next/*` files

### 8. Provider Setup (`components/Providers/tanstack-provider.tsx`)

Wraps the application with:

- `SessionProvider` (NextAuth)
- `QueryClientProvider` (TanStack Query)
- React Query DevTools

## Database Schema

The system uses the `Employee` model from Prisma:

```prisma
model Employee {
  id               String       @id @default(uuid())
  firstName        String
  lastName         String
  password         String
  roleId           Int?
  dateOfEmployment DateTime
  isActive         Boolean      @default(true)
  role             Role?        @relation(fields: [roleId], references: [id])
  historyLogs      HistoryLog[]
}

model Role {
  id        Int        @id @default(autoincrement())
  name      String
  employees Employee[]
}
```

## Usage Examples

### 1. Protecting a Page

```typescript
"use client";
import { useRequireAuth } from "@/hooks/useAuth";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Will redirect to /login

  return <div>Protected Content</div>;
}
```

### 2. Conditional Rendering Based on Authentication

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/logout-button";

export default function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <div>
          <span>Welcome, {user?.name}</span>
          <LogoutButton />
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

### 3. Role-based Access

```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "Admin") {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

### 4. Server-side Session Check

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ServerPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <div>Hello, {session.user.name}</div>;
}
```

## Environment Variables

Required environment variables:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"
```

## Security Considerations

1. **Password Hashing**: Currently uses plain text passwords. Implement bcrypt for production:

   ```bash
   npm install bcrypt @types/bcrypt
   ```

2. **Environment Variables**: Ensure `NEXTAUTH_SECRET` is properly set in production

3. **HTTPS**: Use HTTPS in production for secure cookie transmission

4. **Session Duration**: Configure appropriate session expiration times

5. **Rate Limiting**: Implement rate limiting for login attempts

## Troubleshooting

### Common Issues

1. **"Invalid employee ID or password"**:
   - Check if employee UUID starts with the provided 8 characters
   - Verify employee `isActive` is `true`
   - Confirm password matches exactly

2. **Infinite redirect loops**:
   - Check middleware configuration
   - Ensure `/login` is excluded from protection

3. **Session not persisting**:
   - Verify `NEXTAUTH_SECRET` is set
   - Check browser cookies are enabled
   - Ensure SessionProvider wraps the app

4. **TypeScript errors**:
   - Check `types/next-auth.d.ts` is properly set up
   - Verify custom user properties are declared

### Debug Mode

Enable NextAuth debug mode in development:

```typescript
// In authOptions
debug: process.env.NODE_ENV === "development",
```

## Development Setup

1. **Install Dependencies**:

   ```bash
   npm install next-auth
   ```

2. **Set Environment Variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Database Setup**:

   ```bash
   npx prisma migrate dev
   npx prisma db seed # If you have seed data
   ```

4. **Test Authentication**:
   - Create test employee in database with UUID
   - Visit `/login`
   - Login with first 8 characters of Employee UUID and password
   - Verify redirect to `/event_calendar`

## Production Deployment

1. **Security Checklist**:
   - [ ] Implement password hashing
   - [ ] Set strong `NEXTAUTH_SECRET`
   - [ ] Use HTTPS
   - [ ] Configure session expiration
   - [ ] Implement rate limiting

2. **Environment Setup**:
   - Set production `NEXTAUTH_URL`
   - Configure production database
   - Set secure cookie settings

3. **Monitoring**:
   - Monitor authentication errors
   - Track failed login attempts
   - Set up alerts for security events
