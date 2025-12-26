import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentAccount {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
}

export function usePaymentAccounts() {
  return useQuery({
    queryKey: ["payment_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_accounts")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as PaymentAccount[];
    },
  });
}
