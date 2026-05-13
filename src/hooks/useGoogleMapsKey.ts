import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGoogleMapsKey = () => {
  return useQuery({
    queryKey: ["google-maps-key"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-maps-key");
      if (error) throw error;
      return (data as { key: string }).key;
    },
  });
};
