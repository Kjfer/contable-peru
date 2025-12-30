import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useTransactionCategories } from '@/hooks/useTransactionCategories';
import { usePaymentAccounts } from '@/hooks/usePaymentAccounts';
import { useCurrencies } from '@/hooks/useCurrencies';
import { useUpdateTransaction } from '@/hooks/useTransactions';
import { createTransactionWithInvoice } from '@/lib/accountingService';
import { TransactionType, Transaction } from '@/types/accounting';
import { toast } from 'sonner';
import { Loader2, Receipt } from 'lucide-react';

const transactionSchema = z.object({
  date: z.string().min(1, 'Fecha requerida'),
  type: z.enum(['income', 'expense', 'transfer']),
  businessId: z.string().min(1, 'Negocio requerido'),
  categoryId: z.number().optional(),
  amount: z.number().min(0.01, 'Monto debe ser mayor a 0'),
  fromAccount: z.string().optional(),
  toAccount: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  reference: z.string().optional(),
  currency: z.string().default('PEN'),
  isInvoiced: z.boolean().default(false),
  invoiceNumber: z.string().optional(),
  clientSupplier: z.string().optional(),
  ruc: z.string().optional(),
}).refine((data) => {
  if (data.isInvoiced && data.type !== 'transfer') {
    return data.invoiceNumber && data.invoiceNumber.length > 0;
  }
  return true;
}, {
  message: 'Número de factura requerido',
  path: ['invoiceNumber'],
}).refine((data) => {
  if (data.isInvoiced && data.type !== 'transfer') {
    return data.clientSupplier && data.clientSupplier.length > 0;
  }
  return true;
}, {
  message: 'Cliente/Proveedor requerido',
  path: ['clientSupplier'],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onClose: () => void;
  editTransaction?: Transaction;
}

export function TransactionForm({ onClose, editTransaction }: TransactionFormProps) {
  const isEditing = !!editTransaction;
  const [transactionType, setTransactionType] = useState<TransactionType>(
    editTransaction?.type || 'income'
  );
  const [isInvoiced, setIsInvoiced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const { data: categories, isLoading: categoriesLoading } = useTransactionCategories();
  const { data: paymentAccounts, isLoading: accountsLoading } = usePaymentAccounts();
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const updateTransaction = useUpdateTransaction();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: editTransaction?.type || 'income',
      date: editTransaction?.date || new Date().toISOString().split('T')[0],
      businessId: editTransaction?.businessId || '',
      categoryId: editTransaction?.categoryId || undefined,
      amount: editTransaction?.amount || undefined,
      fromAccount: editTransaction?.fromAccount || '',
      toAccount: editTransaction?.toAccount || '',
      description: editTransaction?.description || '',
      reference: editTransaction?.reference || '',
      currency: editTransaction?.currency || 'PEN',
      isInvoiced: false,
    },
  });

  useEffect(() => {
    if (editTransaction) {
      setValue('businessId', editTransaction.businessId);
      if (editTransaction.categoryId) {
        setValue('categoryId', editTransaction.categoryId);
      }
      if (editTransaction.fromAccount) {
        setValue('fromAccount', editTransaction.fromAccount);
      }
      if (editTransaction.toAccount) {
        setValue('toAccount', editTransaction.toAccount);
      }
      if (editTransaction.currency) {
        setValue('currency', editTransaction.currency);
      }
    }
  }, [editTransaction, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && editTransaction) {
        await updateTransaction.mutateAsync({
          id: editTransaction.id,
          date: data.date,
          type: data.type,
          businessId: data.businessId,
          categoryId: data.categoryId,
          amount: data.amount,
          fromAccount: data.fromAccount,
          toAccount: data.toAccount,
          description: data.description,
          reference: data.reference,
          currency: data.currency,
        });
        toast.success('Transacción actualizada');
      } else {
        await createTransactionWithInvoice({
          date: data.date,
          type: data.type,
          businessId: data.businessId,
          categoryId: data.categoryId,
          amount: data.amount,
          fromAccount: data.fromAccount,
          toAccount: data.toAccount,
          description: data.description,
          reference: data.reference,
          currency: data.currency,
          isInvoiced: data.isInvoiced,
          invoiceNumber: data.invoiceNumber,
          clientSupplier: data.clientSupplier,
          ruc: data.ruc,
        });
        
        const message = data.isInvoiced 
          ? 'Transacción y factura registradas con asiento contable'
          : 'Transacción registrada con asiento contable';
        toast.success(message);
      }
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(isEditing ? 'Error al actualizar la transacción' : 'Error al registrar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories?.filter(
    cat => cat.type === transactionType
  ) || [];

  const isLoading = businessesLoading || categoriesLoading || accountsLoading || currenciesLoading;
  const showInvoiceOption = !isEditing && transactionType !== 'transfer';
  const invoiceTypeLabel = transactionType === 'income' ? 'Factura de Venta' : 'Factura de Compra';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Tipo de Transacción</Label>
          <Select
            value={transactionType}
            onValueChange={(value: TransactionType) => {
              setTransactionType(value);
              setValue('type', value);
              if (value === 'transfer') {
                setIsInvoiced(false);
                setValue('isInvoiced', false);
              }
            }}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Ingreso</SelectItem>
              <SelectItem value="expense">Egreso</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Fecha</Label>
          <Input type="date" {...register('date')} />
          {errors.date && <p className="mt-1 text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div>
          <Label>Negocio</Label>
          <Select 
            value={watch('businessId')} 
            onValueChange={(value) => setValue('businessId', value)} 
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Cargando...' : 'Seleccionar'} />
            </SelectTrigger>
            <SelectContent>
              {businesses?.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessId && <p className="mt-1 text-sm text-destructive">{errors.businessId.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {transactionType !== 'transfer' && (
          <div>
            <Label>Categoría</Label>
            <Select 
              value={watch('categoryId')?.toString()} 
              onValueChange={(value) => setValue('categoryId', parseInt(value))} 
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Cargando...' : 'Seleccionar categoría'} />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {transactionType === 'expense' && (
          <div>
            <Label>Cuenta de Egreso</Label>
            <Select 
              value={watch('fromAccount')} 
              onValueChange={(value) => setValue('fromAccount', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {paymentAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {transactionType === 'income' && (
          <div>
            <Label>Cuenta de Ingreso</Label>
            <Select 
              value={watch('toAccount')} 
              onValueChange={(value) => setValue('toAccount', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {paymentAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {transactionType === 'transfer' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Desde Cuenta</Label>
            <Select 
              value={watch('fromAccount')} 
              onValueChange={(value) => setValue('fromAccount', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {paymentAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hacia Cuenta</Label>
            <Select 
              value={watch('toAccount')} 
              onValueChange={(value) => setValue('toAccount', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {paymentAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Monto</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="flex-1"
            />
            <Select 
              value={watch('currency')} 
              onValueChange={(value) => setValue('currency', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEN">PEN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                {currencies?.map((currency) => (
                  <SelectItem key={currency.id} value={currency.symbol || `Currency${currency.id}`}>
                    {currency.symbol || currency.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.amount && <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>}
        </div>
        <div>
          <Label>Referencia</Label>
          <Input {...register('reference')} placeholder="Ej: FAC-001" />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={3} />
        {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {showInvoiceOption && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="isInvoiced"
              checked={isInvoiced}
              onCheckedChange={(checked) => {
                setIsInvoiced(checked as boolean);
                setValue('isInvoiced', checked as boolean);
              }}
            />
            <Label htmlFor="isInvoiced" className="flex items-center gap-2 cursor-pointer">
              <Receipt className="h-4 w-4" />
              Transacción Facturada ({invoiceTypeLabel})
            </Label>
          </div>

          {isInvoiced && (
            <div className="grid gap-4 md:grid-cols-3 pt-2">
              <div>
                <Label>Número de Factura *</Label>
                <Input {...register('invoiceNumber')} placeholder="Ej: F001-00001" />
                {errors.invoiceNumber && (
                  <p className="mt-1 text-sm text-destructive">{errors.invoiceNumber.message}</p>
                )}
              </div>
              <div>
                <Label>{transactionType === 'income' ? 'Cliente *' : 'Proveedor *'}</Label>
                <Input {...register('clientSupplier')} placeholder="Nombre del cliente/proveedor" />
                {errors.clientSupplier && (
                  <p className="mt-1 text-sm text-destructive">{errors.clientSupplier.message}</p>
                )}
              </div>
              <div>
                <Label>RUC (opcional)</Label>
                <Input {...register('ruc')} placeholder="20123456789" maxLength={11} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing 
            ? 'Actualizar Transacción' 
            : isInvoiced 
              ? 'Guardar Transacción y Factura' 
              : 'Guardar Transacción'
          }
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
