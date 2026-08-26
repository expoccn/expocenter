import { cn } from '@/lib/utils';

interface TooltipPayloadItem {
  name?: string;
  value?: number | string | null;
  color?: string;
  dataKey?: string | number;
}

export function ExpoChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
  className,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  valueFormatter?: (value: number | string | null | undefined, name?: string) => string;
  labelFormatter?: (value: string | number | undefined) => string;
  className?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={cn('expo-chart-tooltip', className)}>
      {label !== undefined && label !== null ? (
        <p className="mb-2 border-b border-border/70 pb-1.5 text-[11px] font-semibold text-foreground">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const rawName = item.name || String(item.dataKey ?? 'Valor');
          const formatted = valueFormatter
            ? valueFormatter(item.value, rawName)
            : item.value == null
              ? 'N/D'
              : typeof item.value === 'number'
                ? item.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                : String(item.value);
          return (
            <div key={`${String(item.dataKey ?? rawName)}-${index}`} className="flex min-w-0 items-center gap-2 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color || 'var(--primary)' }} />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{rawName}</span>
              <strong className="shrink-0 font-semibold tabular-nums text-foreground">{formatted}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
