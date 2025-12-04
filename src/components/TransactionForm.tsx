import { useState } from 'react';
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
import { createTransactionWithInvoice } from '@/lib/accountingService';
import { ACCOUNT_TYPES, TransactionType, AccountType } from '@/types/accounting';
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
  // Invoice fields
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
}

export function TransactionForm({ onClose }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [isInvoiced, setIsInvoiced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const { data: categories, isLoading: categoriesLoading } = useTransactionCategories();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      isInvoiced: false,
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await createTransactionWithInvoice({
        date: data.date!,
        type: data.type!,
        businessId: data.businessId!,
        categoryId: data.categoryId,
        amount: data.amount!,
        fromAccount: data.fromAccount,
        toAccount: data.toAccount,
        description: data.description!,
        reference: data.reference,
        isInvoiced: data.isInvoiced,
        invoiceNumber: data.invoiceNumber,
        clientSupplier: data.clientSupplier,
        ruc: data.ruc,
      });
      
      const message = data.isInvoiced 
        ? 'Transacción y factura registradas con asiento contable'
        : 'Transacción registrada con asiento contable';
      toast.success(message);
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Error al registrar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories?.filter(
    cat => cat.type === transactionType
  ) || [];

  const isLoading = businessesLoading || categoriesLoading;
  const showInvoiceOption = transactionType !== 'transfer';
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
          <Select onValueChange={(value) => setValue('businessId', value)} disabled={isLoading}>
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
            <Select onValueChange={(value) => setValue('categoryId', parseInt(value))} disabled={isLoading}>
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
            <Select onValueChange={(value) => setValue('fromAccount', value as AccountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {transactionType === 'income' && (
          <div>
            <Label>Cuenta de Ingreso</Label>
            <Select onValueChange={(value) => setValue('toAccount', value as AccountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
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
            <Select onValueChange={(value) => setValue('fromAccount', value as AccountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hacia Cuenta</Label>
            <Select onValueChange={(value) => setValue('toAccount', value as AccountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Monto (S/)</Label>
          <Input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
          />
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

      {/* Invoice Section */}
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
          {isInvoiced ? 'Guardar Transacción y Factura' : 'Guardar Transacción'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}