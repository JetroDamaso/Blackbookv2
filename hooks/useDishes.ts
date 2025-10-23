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

export function useUpdateDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dishId,
      name,
      categoryId,
    }: {
      dishId: number;
      name: string;
      categoryId: number;
    }) => updateDish(dishId, name, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDishes"] });
      toast.success("Dish updated successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to update dish:", error);
      toast.error("Failed to update dish");
    },
  });
}

export function useDeleteDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDishes"] });
      toast.success("Dish deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to delete dish:", error);
      toast.error("Failed to delete dish. It may be used in existing menus.");
    },
  });
}

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
    onError: (error: Error) => {
      console.error("Failed to seed dishes:", error);
      toast.error("Failed to seed sample dishes");
    },
  });
}

export function useCheckDatabaseStatus() {
  return useQuery({
    queryKey: ["databaseStatus"],
    queryFn: async () => {
      const { checkDatabaseStatus } = await import("@/server/Dishes/Actions/seedActions");
      return checkDatabaseStatus();
    },
  });
}
