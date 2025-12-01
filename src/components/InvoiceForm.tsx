import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BUSINESSES } from '@/lib/mockData';
import { calculateIGV, formatCurrency } from '@/lib/calculations';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Descripción requerida'),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0.01, 'Precio debe ser mayor a 0'),
});

const invoiceSchema = z.object({
  date: z.string().min(1, 'Fecha requerida'),
  businessId: z.string().min(1, 'Negocio requerido'),
  clientSupplier: z.string().min(1, 'Cliente/Proveedor requerido'),
  ruc: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Número de factura requerido'),
  items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un item'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  type: 'sale' | 'purchase';
  onClose: () => void;
}

export function InvoiceForm({ type, onClose }: InvoiceFormProps) {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);
  
  const igv = calculateIGV(subtotal);
  const total = subtotal + igv;

  const onSubmit = (data: InvoiceFormData) => {
    console.log('Invoice data:', { ...data, type, subtotal, igv, total });
    toast.success('Factura registrada exitosamente');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
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

        <div>
          <Label>N° Factura</Label>
          <Input {...register('invoiceNumber')} placeholder="F001-00001" />
          {errors.invoiceNumber && <p className="mt-1 text-sm text-destructive">{errors.invoiceNumber.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>{type === 'sale' ? 'Cliente' : 'Proveedor'}</Label>
          <Input {...register('clientSupplier')} />
          {errors.clientSupplier && <p className="mt-1 text-sm text-destructive">{errors.clientSupplier.message}</p>}
        </div>
        <div>
          <Label>RUC (opcional)</Label>
          <Input {...register('ruc')} placeholder="20123456789" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Item
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Descripción</Label>
              <Input {...register(`items.${index}.description`)} />
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Precio Unit.</Label>
                <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="financial-number font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IGV (18%):</span>
            <span className="financial-number font-medium">{formatCurrency(igv)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
            <span>Total:</span>
            <span className="financial-number">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Guardar Factura
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
