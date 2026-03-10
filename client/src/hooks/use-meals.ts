import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Meal, InsertMeal } from "@shared/schema";

export function useMeals() {
  return useQuery({
    queryKey: [api.meals.list.path],
    queryFn: async () => {
      const res = await fetch(api.meals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch meals");
      return res.json() as Promise<Meal[]>;
    },
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMeal) => {
      const res = await fetch(api.meals.create.path, {
        method: api.meals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log meal");
      return res.json() as Promise<Meal>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.meals.list.path] });
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.meals.delete.path, { id });
      const res = await fetch(url, {
        method: api.meals.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete meal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.meals.list.path] });
    },
  });
}
