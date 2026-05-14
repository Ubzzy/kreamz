import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRoles } from "@/integrations/firebase/firestore";

export type AppRole = "owner" | "admin" | "user";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["user-roles", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const userRoles = await getUserRoles(user.uid);
      return userRoles.map((r) => r.role as AppRole);
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
