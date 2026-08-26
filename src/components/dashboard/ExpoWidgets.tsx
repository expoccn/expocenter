import {
  AlertTriangle,
  CheckCircle2,
  CircleGauge,
  Database,
  Droplets,
  Fan,
  Gauge,
  Info,
  Snowflake,
  Thermometer,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ExpoChiller, ExpoPumpGroup, ExpoTone, ExpoTrendPoint } from '@/types/expo';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ExpoChartTooltip } from '@/components/dashboard/ChartTooltip';

const toneClasses: Record<ExpoTone, string> = {
  ok: 'text-success bg-success/8 border-success/20',
  warn: 'text-warning bg-warning/8 border-warning/20',
  crit: 'text-critical bg-critical/8 border-critical/20',
  info: 'text-primary bg-primary/8 border-primary/20',
  pending: 'text-muted-foreground bg-muted/60 border-border',
};

export function MetricCard({
  label,
  value,
  detail,
  tone = 'info',
  icon: Icon = CircleGauge,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: ExpoTone;
  icon?: LucideIcon;
}) {
  return (
    <article className="expo-kpi min-w-0 rounded-[13px] p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.09em] text-muted-foreground sm:text-[10px]">{label}</p>
          <p className="mt-2 break-words text-[1.55rem] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[1.7rem]">{value}</p>
        </div>
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', toneClasses[tone])}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
      </div>
      {detail ? <p className="mt-2 text-[10px] leading-[1.45] text-muted-foreground sm:text-[11px]">{detail}</p> : null}
    </article>
  );
}

function fmt(value: number | null, suffix = '', digits = 1) {
  return value == null ? 'N/D' : `${value.toFixed(digits).replace('.', ',')}${suffix}`;
}

function chillerTone(chiller: ExpoChiller): ExpoTone {
  if (chiller.state === 'INSUFFICIENT_DATA') return 'warn';
  if (chiller.alarmCode && chiller.alarmCode !== '0') return 'warn';
  return chiller.state === 'OPERATING' ? 'ok' : 'info';
}

export function ChillerSummaryCard({ chiller, selected = false, onClick }: { chiller: ExpoChiller; selected?: boolean; onClick?: () => void }) {
  const tone = chillerTone(chiller);
  const stateLabel = chiller.state === 'OPERATING' ? 'Operando' : chiller.state === 'STOPPED' ? 'Parado' : 'Dados insuficientes';
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Snowflake className="h-4 w-4 text-primary" /><h3 className="truncate text-[13px] font-semibold">{chiller.label}</h3></div>
          <p className="mt-1 text-[10px] text-muted-foreground">Carrier 30HX</p>
        </div>
        <StatusBadge label={stateLabel} tone={tone} />
      </div>
      <div className="mt-3 grid grid-cols-4 divide-x divide-border/70">
        {[
          ['Capacidade', fmt(chiller.capacityPct, '%')],
          ['ΔT', fmt(chiller.deltaTC, ' °C')],
          ['Horas', fmt(chiller.operatingHours, ' h')],
          ['Cobertura', fmt(chiller.coveragePct, '%')],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 px-2 first:pl-0 last:pr-0">
            <p className="truncate text-[8px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-[12px] font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn('expo-panel w-full min-w-0 rounded-[13px] p-3.5 text-left transition-colors', selected ? 'border-primary/45 bg-primary/[0.045]' : 'hover:border-primary/28 hover:bg-primary/[0.025]')}>
        {content}
      </button>
    );
  }
  return <article className="expo-panel min-w-0 rounded-[13px] p-3.5">{content}</article>;
}

export function ChillerCard({ chiller }: { chiller: ExpoChiller }) {
  const tone = chillerTone(chiller);
  const stateLabel = chiller.state === 'OPERATING' ? 'Operando' : chiller.state === 'STOPPED' ? 'Parado' : 'Dados insuficientes';
  return (
    <article className="expo-panel min-w-0 overflow-hidden rounded-[14px]">
      <div className="border-b border-border/75 bg-primary/[0.035] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><Snowflake className="h-4.5 w-4.5 shrink-0 text-primary" /><h3 className="truncate text-sm font-semibold">{chiller.label}</h3></div>
            <p className="mt-1 text-[10px] text-muted-foreground">Carrier 30HX · Grupo {chiller.id}</p>
          </div>
          <StatusBadge label={stateLabel} tone={tone} />
        </div>
        <div className="mt-4 grid grid-cols-4 divide-x divide-border/70">
          {[
            ['Capacidade', fmt(chiller.capacityPct, '%')],
            ['ΔT', fmt(chiller.deltaTC, ' °C')],
            ['Entrada', fmt(chiller.waterInC, ' °C')],
            ['Saída', fmt(chiller.waterOutC, ' °C')],
          ].map(([label, value]) => <div key={label} className="min-w-0 px-2 first:pl-0 last:pr-0"><p className="truncate text-[8px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 truncate text-[13px] font-semibold">{value}</p></div>)}
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-2.5 p-4 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Setpoint</span><strong>{fmt(chiller.setpointC, ' °C')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Temp. externa</span><strong>{fmt(chiller.externalTempC, ' °C')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Sucção A / B</span><strong>{fmt(chiller.suctionA, '')} / {fmt(chiller.suctionB, '')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Descarga A / B</span><strong>{fmt(chiller.dischargeA, '')} / {fmt(chiller.dischargeB, '')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Compressores</span><strong>{chiller.compressorCount == null ? 'N/D' : chiller.compressorCount}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Alarme</span><strong>{chiller.alarmCode ?? 'N/D'}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Circuitos A / B</span><strong>{fmt(chiller.circuitAPct, '%')} / {fmt(chiller.circuitBPct, '%')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Operação</span><strong>{fmt(chiller.operatingHours, ' h')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Partidas</span><strong>{chiller.starts ?? 'N/D'}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Horas em alarme</span><strong>{fmt(chiller.alarmHours, ' h')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Óleo A1 / A2</span><strong>{fmt(chiller.oilA1, '')} / {fmt(chiller.oilA2, '')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">Óleo B1 / B2</span><strong>{fmt(chiller.oilB1, '')} / {fmt(chiller.oilB2, '')}</strong></div>
      </div>

      <div className="border-t border-border/75 px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-[10px]"><span className="text-muted-foreground">Cobertura da fonte</span><span className="font-semibold">{fmt(chiller.coveragePct, '%')}</span></div>
        <CoverageBar value={chiller.coveragePct} />
        {chiller.note ? <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">{chiller.note}</p> : null}
      </div>
    </article>
  );
}

export function PumpGroupCard({ group }: { group: ExpoPumpGroup }) {
  const active = group.pumps.filter((pump) => pump.state === 'ON').length;
  return (
    <article className="expo-panel min-w-0 rounded-[14px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Waves className="h-4.5 w-4.5 text-primary" /><h3 className="truncate text-sm font-semibold">{group.label}</h3></div>
          <p className="mt-1 text-[10px] text-muted-foreground">{active} de {group.pumps.length} bombas ativas</p>
        </div>
        <StatusBadge label={group.coveragePct == null ? 'Sem dados' : `${group.coveragePct.toFixed(0)}% cobertura`} tone={group.coveragePct != null && group.coveragePct >= 90 ? 'ok' : 'warn'} />
      </div>

      <div className="mt-3 grid grid-cols-3 divide-x divide-border/70 rounded-xl bg-surface/65 px-2 py-3">
        <div className="px-2"><Gauge className="mb-1.5 h-3.5 w-3.5 text-primary" /><p className="text-[8px] uppercase text-muted-foreground">Pressão</p><p className="mt-1 text-[12px] font-semibold">{fmt(group.pressure, ' bar', 2)}</p></div>
        <div className="px-2"><CircleGauge className="mb-1.5 h-3.5 w-3.5 text-primary" /><p className="text-[8px] uppercase text-muted-foreground">Setpoint</p><p className="mt-1 text-[12px] font-semibold">{fmt(group.pressureSetpoint, ' bar', 2)}</p></div>
        <div className="px-2"><Fan className="mb-1.5 h-3.5 w-3.5 text-primary" /><p className="text-[8px] uppercase text-muted-foreground">Bypass</p><p className="mt-1 text-[12px] font-semibold">{fmt(group.bypassPct, '%', 0)}</p></div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]">
        <div className="rounded-lg bg-surface/65 px-2.5 py-2"><span className="text-muted-foreground">Horas Local</span><p className="mt-1 font-semibold">{fmt(group.localHoursTotal, ' h')}</p></div>
        <div className="rounded-lg bg-surface/65 px-2.5 py-2"><span className="text-muted-foreground">Horas alarme</span><p className="mt-1 font-semibold">{fmt(group.alarmHoursTotal, ' h')}</p></div>
        <div className="rounded-lg bg-surface/65 px-2.5 py-2"><span className="text-muted-foreground">Partidas</span><p className="mt-1 font-semibold">{group.startsTotal ?? 'N/D'}</p></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {group.pumps.map((pump) => (
          <div key={pump.id} className="rounded-lg border border-border/80 bg-background/55 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold">{pump.label}</span><span className={cn('h-1.5 w-1.5 rounded-full', pump.state === 'ON' ? 'bg-success' : pump.state === 'OFF' ? 'bg-muted-foreground/35' : 'bg-warning')} /></div>
            <p className="mt-1 text-[8px] text-muted-foreground">{pump.remote == null ? 'Modo N/D' : pump.remote ? 'Remoto' : 'Local'} · {pump.alarm ? 'Alarme' : 'Sem alarme'}</p>
            <p className="mt-1 text-[8px] text-muted-foreground">ON {fmt(pump.operatingHours, ' h')} · Local {fmt(pump.localHours, ' h')}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function CoverageBar({ value }: { value: number | null }) {
  const width = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full', width >= 90 ? 'bg-success' : width >= 60 ? 'bg-warning' : 'bg-critical')} style={{ width: `${width}%` }} />
    </div>
  );
}

export function CagTrendChart({ data }: { data: ExpoTrendPoint[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, { id: string; label: string; points: ExpoTrendPoint[] }>();
    for (const point of data) {
      const match = String(point.label || '').match(/^(Azul|Branco|Vermelho)\s+(.+)$/i);
      const id = match?.[1]?.toLowerCase() || 'consolidado';
      const label = match?.[1] ? `${match[1].charAt(0).toUpperCase()}${match[1].slice(1).toLowerCase()}` : 'Consolidado';
      const cleanLabel = match?.[2] || point.label;
      const current = map.get(id) || { id, label, points: [] };
      current.points.push({ ...point, label: cleanLabel });
      map.set(id, current);
    }
    const order = ['azul', 'branco', 'vermelho', 'consolidado'];
    return [...map.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [data]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const activeGroup = groups.find((group) => group.id === selectedGroup) || groups[0];
  const selectedData = activeGroup?.points || [];
  const hasCapacity = selectedData.some((point) => point.capacity != null);

  if (!data.length || !activeGroup || !selectedData.length) {
    return <div className="flex h-[245px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 px-4 text-center text-[12px] text-muted-foreground">Sem série temporal disponível para o período selecionado. Ausência de amostra não é convertida em zero.</div>;
  }

  return (
    <div className="min-w-0 space-y-2.5">
      {groups.length > 1 ? (
        <div className="expo-segmented">
          {groups.map((group) => <button key={group.id} type="button" onClick={() => setSelectedGroup(group.id)} data-active={activeGroup.id === group.id} className="expo-segmented-button">{group.label}</button>)}
        </div>
      ) : null}

      <div className="h-[270px] min-w-0 w-full sm:h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={selectedData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis yAxisId="temp" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
            {hasCapacity ? <YAxis yAxisId="cap" orientation="right" domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} /> : null}
            <Tooltip content={<ExpoChartTooltip valueFormatter={(value, name) => name?.includes('%') ? `${Number(value).toFixed(1).replace('.', ',')}%` : `${Number(value).toFixed(2).replace('.', ',')} °C`} />} />
            <Line yAxisId="temp" type="monotone" dataKey="inlet" name="Entrada °C" stroke="var(--primary)" strokeWidth={2.1} dot={false} connectNulls={false} />
            <Line yAxisId="temp" type="monotone" dataKey="outlet" name="Saída °C" stroke="var(--success)" strokeWidth={2.1} dot={false} connectNulls={false} />
            <Line yAxisId="temp" type="monotone" dataKey="deltaT" name="ΔT °C" stroke="var(--warning)" strokeWidth={1.9} dot={false} connectNulls={false} />
            {hasCapacity ? <Line yAxisId="cap" type="monotone" dataKey="capacity" name="Capacidade %" stroke="var(--purple)" strokeWidth={1.9} dot={false} connectNulls={false} /> : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WaterTrendChart({ data }: { data: ExpoTrendPoint[] }) {
  return (
    <div className="h-[255px] min-w-0 w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => `${Number(value).toFixed(1).replace('.', ',')} m³`} />} />
          <Line type="monotone" dataKey="waterConsumption" name="Consumo" stroke="var(--primary)" strokeWidth={2.3} dot={{ r: 2.2 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceStatusIcon({ status }: { status: 'OK' | 'DEGRADED' | 'NO_DATA' | 'COMM_ERROR' }) {
  if (status === 'OK') return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === 'DEGRADED') return <AlertTriangle className="h-4 w-4 text-warning" />;
  if (status === 'COMM_ERROR') return <Database className="h-4 w-4 text-critical" />;
  return <Info className="h-4 w-4 text-muted-foreground" />;
}

export const expoMetricIcons = { temp: Thermometer, water: Droplets, gauge: Gauge, quality: Database };
