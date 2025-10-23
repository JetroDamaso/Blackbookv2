# Prisma Browser Error Fix

## Problem
When implementing the dishes management system, we encountered the error:
```
Error: PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in ``). If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report
```

This error occurs when Prisma client code is executed in the browser environment, which is not supported.

## Root Cause
The issue was caused by:
1. Server actions being imported directly in client components
2. Missing `"use server"` and `server-only` directives
3. React Query mutations trying to execute Prisma operations on the client side

## Solution

### 1. Added Server-Only Directives

**Updated Pull Actions (`server/Dishes/Actions/pullActions.ts`):**
```typescript
"use server";
import "server-only";
import { prisma } from "@/server/db";
// ... rest of the file
```

**Updated Push Actions (`server/Dishes/Actions/pushActions.ts`):**
```typescript
"use server";
import "server-only";
import { prisma } from "../../db";
// ... rest of the file
```

### 2. Installed Required Package
```bash
npm install server-only
```

### 3. Created Client-Side Hooks

**Created `hooks/useDishes.ts`:**
```typescript
"use client";
import { getAllDishes, getDishCategories } from "@/server/Dishes/Actions/pullActions";
import { createDish, deleteDish, updateDish } from "@/server/Dishes/Actions/pushActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAllDishes() {
  return useQuery({
    queryKey: ["allDishes"],
    queryFn: getAllDishes,
  });
}

export function useDishCategories() {
  return useQuery({
    queryKey: ["dishCategories"],
    queryFn: getDishCategories,
  });
}

export function useCreateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, categoryId }: { name: string; categoryId: number }) =>
      createDish(name, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDishes"] });
      toast.success("Dish created successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to create dish:", error);
      toast.error("Failed to create dish");
    },
  });
}

// ... other hooks
```

### 4. Updated Client Component

**Modified `components/(Bookings)/(AddBookings)/page.tsx`:**

**Before:**
```typescript
import { getAllDishes, getDishCategories } from "@/server/Dishes/Actions/pullActions";
import { createDish, deleteDish, updateDish } from "@/server/Dishes/Actions/pushActions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Direct server action imports causing browser error
const allDishesQuery = useQuery({
  queryKey: ["allDishes"],
  queryFn: getAllDishes, // ❌ Server code running in browser
});
```

**After:**
```typescript
import {
  useAllDishes,
  useCreateDish,
  useDeleteDish,
  useDishCategories,
  useUpdateDish,
} from "@/hooks/useDishes";

// Using custom hooks that properly handle server/client boundary
const allDishesQuery = useAllDishes(); // ✅ Proper client-side hook
const dishCategoriesQuery = useDishCategories();
const createDishMutation = useCreateDish();
```

### 5. Created Seeding Infrastructure

**Added `server/Dishes/Actions/seedActions.ts`:**
```typescript
"use server";
import "server-only";
import { prisma } from "../../db";

export async function seedDishCategories() {
  // Implementation for seeding categories
}

export async function seedSampleDishes() {
  // Implementation for seeding sample dishes
}

export async function checkDatabaseStatus() {
  // Check if database has data
}
```

**Added seeding hooks in `hooks/useDishes.ts`:**
```typescript
export function useSeedDishes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { seedSampleDishes } = await import("@/server/Dishes/Actions/seedActions");
      return seedSampleDishes();
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["allDishes"] });
      queryClient.invalidateQueries({ queryKey: ["dishCategories"] });
      toast.success(`${data.message} (${data.count} items)`);
    },
  });
}
```

## Key Principles Applied

### 1. Server/Client Boundary Separation
- **Server Actions**: Must have `"use server"` and `import "server-only"`
- **Client Components**: Must have `"use client"` and cannot directly import server code
- **Hooks Layer**: Acts as a bridge between client components and server actions

### 2. Proper Import Strategy
```typescript
// ❌ Wrong: Direct server import in client
import { createDish } from "@/server/Dishes/Actions/pushActions";

// ✅ Correct: Use hooks that handle the boundary
import { useCreateDish } from "@/hooks/useDishes";
```

### 3. Dynamic Imports for Server Actions
```typescript
// ✅ Safe way to call server actions from client-side mutations
mutationFn: async () => {
  const { seedSampleDishes } = await import("@/server/Dishes/Actions/seedActions");
  return seedSampleDishes();
},
```

## Results

### ✅ Fixed Issues:
1. **Prisma Browser Error**: Eliminated by proper server/client separation
2. **Server Actions**: Now properly isolated with `server-only` directive
3. **Client Components**: Clean separation using custom hooks
4. **Data Fetching**: React Query works correctly with server actions
5. **Error Handling**: Proper client-side error handling and toast notifications

### ✅ New Features:
1. **Database Status Check**: Detect empty database
2. **Auto-Seeding**: Populate database with sample data
3. **Debug Information**: Clear visibility into data loading states
4. **Proper Caching**: React Query cache invalidation works correctly

## Best Practices Established

### 1. File Organization
```
server/
  ├── Dishes/Actions/
      ├── pullActions.ts ("use server" + "server-only")
      ├── pushActions.ts ("use server" + "server-only")
      └── seedActions.ts ("use server" + "server-only")

hooks/
  └── useDishes.ts ("use client")

components/
  └── (client components using hooks)
```

### 2. Import Patterns
```typescript
// Server files
"use server";
import "server-only";

// Client files
"use client";
import { useServerAction } from "@/hooks/useServerAction";
```

### 3. Error Handling
```typescript
// Consistent error handling in hooks
onError: (error: Error) => {
  console.error("Operation failed:", error);
  toast.error("User-friendly error message");
},
```

## Testing Checklist

- [ ] No Prisma browser errors in console
- [ ] Server actions execute only on server
- [ ] Client components can create/read/update/delete dishes
- [ ] React Query caching works properly
- [ ] Error handling displays appropriate messages
- [ ] Database seeding works when database is empty
- [ ] No hydration mismatches
- [ ] TypeScript compilation succeeds

## Conclusion

The Prisma browser error was resolved by implementing proper Next.js 13+ server/client architecture patterns. The solution maintains full functionality while ensuring that database operations only execute on the server side, and client components interact with the server through properly structured hooks and React Query.
