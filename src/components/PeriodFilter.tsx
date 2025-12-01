import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface PeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const periods = [
  { value: 'current-month', label: 'Mes actual' },
  { value: 'last-month', label: 'Mes anterior' },
  { value: 'current-quarter', label: 'Trimestre actual' },
  { value: 'current-year', label: 'Año actual' },
  { value: 'last-year', label: 'Año anterior' },
  { value: 'all', label: 'Todo el período' },
];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <Calendar className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Seleccionar período" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
