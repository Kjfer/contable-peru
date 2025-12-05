import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getDateRangeFromPeriod } from '@/lib/periodUtils';

interface UseTransactionsOptions {
  businessId?: string;
  period?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  return useQuery({
    queryKey: ['transactions', options],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:transaction_categories(id, name, type)
        `)
        .order('date', { ascending: false });

      if (options.businessId && options.businessId !== 'all') {
        query = query.eq('business_id', options.businessId);
      }

      if (options.period && options.period !== 'all') {
        const { startDate, endDate } = getDateRangeFromPeriod(options.period);
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      // First get the transaction to check if it has an invoice
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('invoice_id')
        .eq('id', transactionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Delete accounting entries related to this transaction
      await supabase
        .from('accounting_entries')
        .delete()
        .eq('transaction_id', transactionId);

      // Delete the transaction
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (deleteError) throw deleteError;

      // If there's a linked invoice, delete it and its items
      if (transaction?.invoice_id) {
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', transaction.invoice_id);

        await supabase
          .from('invoices')
          .delete()
          .eq('id', transaction.invoice_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['accounting_entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      date: string;
      type: string;
      businessId: string;
      categoryId?: number;
      amount: number;
      fromAccount?: string;
      toAccount?: string;
      description: string;
      reference?: string;
    }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          date: data.date,
          type: data.type as 'income' | 'expense' | 'transfer',
          business_id: data.businessId,
          category_id: data.categoryId || null,
          amount: data.amount,
          from_account: data.fromAccount || null,
          to_account: data.toAccount || null,
          description: data.description,
          reference: data.reference || null,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
    },
  });
}
