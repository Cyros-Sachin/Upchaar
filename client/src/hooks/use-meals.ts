import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Meal, InsertMeal } from "@shared/schema";
import { authClient } from "@/lib/auth-client";

export function useMeals() {
  return useQuery({
    queryKey: [api.meals.list.path],
    queryFn: async () => {
      const token = authClient.getToken();
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(api.meals.list.path, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch meals");
      return res.json() as Promise<Meal[]>;
    },
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMeal) => {
      const token = authClient.getToken();
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(api.meals.create.path, {
        method: api.meals.create.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
      const token = authClient.getToken();
      if (!token) throw new Error("Not authenticated");
      
      const url = buildUrl(api.meals.delete.path, { id });
      const res = await fetch(url, {
        method: api.meals.delete.method,
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete meal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.meals.list.path] });
    },
  });
}
