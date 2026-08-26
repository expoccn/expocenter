import { AlertTriangle, CalendarDays, CheckCircle2, Database, RefreshCw } from 'lucide-react';
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
  const coverage = data.quality.overallCoveragePct;

  return (
    <header className="space-y-3 pb-1">
      <div className="flex min-w-0 items-start gap-3">
        <div className="pt-0.5 lg:hidden"><MobileSidebar /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 text-[1.35rem] font-semibold tracking-[-0.035em] text-foreground sm:text-[1.55rem] xl:text-[1.7rem]">{title}</h1>
            {data.header.previewMode ? (
              <span className="rounded-full border border-warning/25 bg-warning/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-warning">Homologação</span>
            ) : null}
            {data.header.dataFreshness === 'STALE' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-warning">
                <AlertTriangle className="h-3 w-3" /> Histórico · {fmtDate(data.period.referenceDate)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] font-semibold text-primary">Expo Center Norte <span className="mx-1.5 text-muted-foreground/50">·</span> CAG &amp; Gestão Hídrica</p>
          {description ? <p className="mt-1.5 max-w-4xl text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">{description}</p> : null}
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <div className="mr-1 hidden text-right 2xl:block">
            <p className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(data.period.startDate)} — {fmtDate(data.period.endDate)}</p>
            <p className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className={cn('h-3.5 w-3.5', data.header.dataFreshness === 'STALE' ? 'text-warning' : 'text-success')} />
              {data.header.dataFreshness === 'STALE' ? 'Dados históricos' : 'Dados atualizados'}
            </p>
          </div>
          <ThemeToggle compact />
          {onRefresh ? (
            <button type="button" onClick={onRefresh} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[11px] font-semibold text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground">
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Atualizar
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="dashboard-scrollbar overflow-x-auto pb-0.5">
          <div className="flex min-w-max items-center gap-2">
            <span className="mr-1 text-[11px] font-medium text-muted-foreground">Período</span>
            <div className="expo-segmented">
              {periods.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  data-active={period === item}
                  className="expo-segmented-button"
                >
                  {periodLabels[item]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground 2xl:hidden">
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(data.period.startDate)} — {fmtDate(data.period.endDate)}</span>
          <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> Cobertura {coverage == null ? 'N/D' : `${coverage.toFixed(1).replace('.', ',')}%`}</span>
        </div>
      </div>
    </header>
  );
}
