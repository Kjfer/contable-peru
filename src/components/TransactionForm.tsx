import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BUSINESSES, MOCK_TRANSACTIONS } from '@/lib/mockData';
import { TRANSACTION_CATEGORIES, ACCOUNT_TYPES, TransactionType, AccountType } from '@/types/accounting';
import { toast } from 'sonner';

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
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onClose: () => void;
}

export function TransactionForm({ onClose }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    console.log('Transaction data:', data);
    toast.success('Transacción registrada exitosamente');
    onClose();
  };

  const filteredCategories = TRANSACTION_CATEGORIES.filter(
    cat => cat.type === transactionType
  );

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
          <Select onValueChange={(value) => setValue('businessId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESSES.filter(b => b.id !== 'all').map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessId && <p className="mt-1 text-sm text-destructive">{errors.businessId.message}</p>}
        </div>
      </div>

      {transactionType !== 'transfer' && (
        <div>
          <Label>Categoría</Label>
          <Select onValueChange={(value) => setValue('categoryId', parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
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

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Guardar Transacción
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
