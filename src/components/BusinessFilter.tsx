import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BUSINESSES } from '@/lib/mockData';

interface BusinessFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function BusinessFilter({ value, onChange }: BusinessFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Seleccionar negocio" />
      </SelectTrigger>
      <SelectContent>
        {BUSINESSES.map((business) => (
          <SelectItem key={business.id} value={business.id}>
            {business.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
