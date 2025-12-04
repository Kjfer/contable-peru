import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinesses } from '@/hooks/useBusinesses';

interface BusinessFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function BusinessFilter({ value, onChange }: BusinessFilterProps) {
  const { data: businesses } = useBusinesses();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Seleccionar negocio" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los negocios</SelectItem>
        {(businesses || []).map((business) => (
          <SelectItem key={business.id} value={business.id}>
            {business.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
