import { AlertTriangle, CalendarDays, Database, RefreshCw } from 'lucide-react';
import { periodLabels, usePeriod } from '@/context/PeriodContext';
import type { PeriodType } from '@/types/api';
import type { ExpoDashboard } from '@/types/expo';
import { cn } from '@/lib/utils';
import { MobileSidebar } from '@/components/dashboard/Sidebar';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

const periods: PeriodType[] = ['d1', '7d', '30d'];

function fmtDate(value: string) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

export function ExpoHeader({
  title,
  description,
  data,
  refreshing,
  onRefresh,
}: {
  title: string;
  description?: string;
  data: ExpoDashboard;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const { period, setPeriod } = usePeriod();
  return (
    <header className="space-y-4 border-b border-border pb-5">
      <div className="flex items-start gap-3">
        <div className="pt-0.5 lg:hidden"><MobileSidebar /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 text-xl font-semibold tracking-tight sm:text-2xl xl:text-[1.75rem]">{title}</h1>
            {data.header.previewMode ? (
              <span className="rounded-full border border-warning/25 bg-warning/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-warning">Homologação</span>
            ) : null}
            {data.header.dataFreshness === 'STALE' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-warning"><AlertTriangle className="h-3 w-3" /> Dados históricos · ref. {fmtDate(data.period.referenceDate)}</span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Expo Center Norte</span>
            <span className="px-2">|</span>
            <span>CAG &amp; Gestão Hídrica</span>
          </p>
          {description ? <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle compact />
          {onRefresh ? (
            <button type="button" onClick={onRefresh} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground">
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Atualizar
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Período</span>
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                period === item
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {periodLabels[item]}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{fmtDate(data.period.startDate)} — {fmtDate(data.period.endDate)}</span></span>
          <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> Cobertura {data.quality.overallCoveragePct == null ? 'N/D' : `${data.quality.overallCoveragePct.toFixed(1).replace('.', ',')}%`}</span>
        </div>
      </div>
    </header>
  );
}
