import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { User, UpdateUserRequest } from "@shared/schema";
import { authClient } from "@/lib/auth-client";

export function useUser() {
  return useQuery({
    queryKey: [api.users.me.path],
    queryFn: async () => {
      const token = authClient.getToken();
      if (!token) return null;
      
      const res = await fetch(api.users.me.path, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json() as Promise<User>;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const token = authClient.getToken();
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(api.users.update.path, {
        method: api.users.update.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    },
  });
}
