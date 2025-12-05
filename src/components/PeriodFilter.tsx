import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const presetPeriods = [
  { value: 'current-month', label: 'Mes actual' },
  { value: 'last-month', label: 'Mes anterior' },
  { value: 'current-quarter', label: 'Trimestre actual' },
  { value: 'current-year', label: 'Año actual' },
  { value: 'last-year', label: 'Año anterior' },
  { value: 'all', label: 'Todo el período' },
];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Parse current value to show correct label
  const displayLabel = useMemo(() => {
    // Check if it's a preset period
    const preset = presetPeriods.find(p => p.value === value);
    if (preset) return preset.label;

    // Check if it's a specific month (format: YYYY-MM)
    if (value && value.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = value.split('-');
      return `${MONTHS[parseInt(month) - 1]} ${year}`;
    }

    return 'Seleccionar período';
  }, [value]);

  const handleMonthSelect = (monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    onChange(`${selectedYear}-${monthStr}`);
    setIsOpen(false);
  };

  const handlePresetSelect = (presetValue: string) => {
    onChange(presetValue);
    setIsOpen(false);
  };

  const years = useMemo(() => {
    const result = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      result.push(y);
    }
    return result;
  }, [currentYear]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[220px] justify-start">
          <Calendar className="mr-2 h-4 w-4" />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">Períodos predefinidos</p>
          <div className="grid grid-cols-2 gap-2">
            {presetPeriods.map((period) => (
              <Button
                key={period.value}
                variant={value === period.value ? "default" : "outline"}
                size="sm"
                className="text-xs justify-start"
                onClick={() => handlePresetSelect(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-3">
          <p className="text-sm font-medium text-muted-foreground mb-2">Seleccionar mes específico</p>
          
          {/* Year selector */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedYear(y => y - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedYear(y => y + 1)}
              disabled={selectedYear >= currentYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const monthValue = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
              const isSelected = value === monthValue;
              const isFuture = selectedYear === currentYear && index > new Date().getMonth();

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs",
                    isFuture && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isFuture}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month.slice(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
