import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Plan } from "@shared/schema";

export function useLatestPlan() {
  return useQuery({
    queryKey: [api.plans.latest.path],
    queryFn: async () => {
      const res = await fetch(api.plans.latest.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch latest plan");
      return res.json() as Promise<Plan>;
    },
  });
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.plans.generate.path, {
        method: api.plans.generate.method,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to generate AI plan");
      }
      return res.json() as Promise<Plan>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plans.latest.path] });
    },
  });
}
