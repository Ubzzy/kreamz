import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "owner" | "admin" | "user";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role as AppRole);
    },
  });

  const has = (role: AppRole) => !!roles?.includes(role);
  return {
    roles: roles ?? [],
    isLoading: !!user && isLoading,
    isOwner: has("owner"),
    isAdmin: has("admin"),
    canManage: has("owner") || has("admin"),
  };
};
