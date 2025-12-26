import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPeriodDates } from "@/lib/periodUtils";

export interface AccountMovement {
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
  amount: number;
  balance: number;
  businessName?: string;
}

export interface AccountBalance {
  accountName: string;
  accountType: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  movements: AccountMovement[];
}

export function useAccountBalances(businessId: string, period: string) {
  return useQuery({
    queryKey: ["account_balances", businessId, period],
    queryFn: async () => {
      const { startDate, endDate } = getPeriodDates(period);

      // Get all payment accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("payment_accounts")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (accountsError) throw accountsError;

      // Get all transactions within the period
      let transactionsQuery = supabase
        .from("transactions")
        .select("*, businesses(name)")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (businessId !== "all") {
        transactionsQuery = transactionsQuery.eq("business_id", businessId);
      }

      const { data: transactions, error: transactionsError } = await transactionsQuery;

      if (transactionsError) throw transactionsError;

      // Calculate balances for each account
      const accountBalances: AccountBalance[] = (accounts || []).map((account) => {
        const movements: AccountMovement[] = [];
        let totalIncome = 0;
        let totalExpense = 0;
        let runningBalance = 0;

        (transactions || []).forEach((tx: any) => {
          const businessName = tx.businesses?.name || '';
          
          // Income to this account
          if (tx.type === 'income' && tx.to_account === account.name) {
            runningBalance += Number(tx.amount);
            totalIncome += Number(tx.amount);
            movements.push({
              date: tx.date,
              description: tx.description || 'Ingreso',
              type: 'income',
              amount: Number(tx.amount),
              balance: runningBalance,
              businessName,
            });
          }
          
          // Expense from this account
          if (tx.type === 'expense' && tx.from_account === account.name) {
            runningBalance -= Number(tx.amount);
            totalExpense += Number(tx.amount);
            movements.push({
              date: tx.date,
              description: tx.description || 'Egreso',
              type: 'expense',
              amount: Number(tx.amount),
              balance: runningBalance,
              businessName,
            });
          }
          
          // Transfer from this account
          if (tx.type === 'transfer' && tx.from_account === account.name) {
            runningBalance -= Number(tx.amount);
            totalExpense += Number(tx.amount);
            movements.push({
              date: tx.date,
              description: `Transferencia a ${tx.to_account}`,
              type: 'transfer_out',
              amount: Number(tx.amount),
              balance: runningBalance,
              businessName,
            });
          }
          
          // Transfer to this account
          if (tx.type === 'transfer' && tx.to_account === account.name) {
            runningBalance += Number(tx.amount);
            totalIncome += Number(tx.amount);
            movements.push({
              date: tx.date,
              description: `Transferencia desde ${tx.from_account}`,
              type: 'transfer_in',
              amount: Number(tx.amount),
              balance: runningBalance,
              businessName,
            });
          }
        });

        return {
          accountName: account.name,
          accountType: account.type,
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          movements,
        };
      });

      return accountBalances;
    },
  });
}
