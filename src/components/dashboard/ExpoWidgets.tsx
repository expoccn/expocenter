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
    <article className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">{value}</p>
      {detail ? <p className="mt-1 min-h-8 text-xs leading-relaxed text-muted-foreground">{detail}</p> : null}
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

export function ChillerCard({ chiller }: { chiller: ExpoChiller }) {
  const tone = chillerTone(chiller);
  const stateLabel = chiller.state === 'OPERATING' ? 'Operando' : chiller.state === 'STOPPED' ? 'Parado' : 'Dados insuficientes';
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 shrink-0 text-primary" />
              <h3 className="truncate text-base font-semibold">{chiller.label}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Carrier 30HX · Grupo {chiller.id}</p>
          </div>
          <StatusBadge label={stateLabel} tone={tone} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Capacidade</p><p className="mt-1 text-lg font-semibold">{fmt(chiller.capacityPct, '%')}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">ΔT</p><p className="mt-1 text-lg font-semibold">{fmt(chiller.deltaTC, ' °C')}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Entrada</p><p className="mt-1 text-lg font-semibold">{fmt(chiller.waterInC, ' °C')}</p></div>
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Saída</p><p className="mt-1 text-lg font-semibold">{fmt(chiller.waterOutC, ' °C')}</p></div>
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-3 p-4 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">Setpoint</span><strong>{fmt(chiller.setpointC, ' °C')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">Temp. externa</span><strong>{fmt(chiller.externalTempC, ' °C')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">Sucção A / B</span><strong>{fmt(chiller.suctionA, '')} / {fmt(chiller.suctionB, '')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">Descarga A / B</span><strong>{fmt(chiller.dischargeA, '')} / {fmt(chiller.dischargeB, '')}</strong></div>
        <div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">Compressores</span><strong>{chiller.compressorCount == null ? 'N/D' : chiller.compressorCount}</strong></div>
        <div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">Alarme</span><strong>{chiller.alarmCode ?? 'N/D'}</strong></div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Cobertura da fonte</span>
          <span className="font-semibold">{fmt(chiller.coveragePct, '%')}</span>
        </div>
        <CoverageBar value={chiller.coveragePct} />
        {chiller.note ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{chiller.note}</p> : null}
      </div>
    </article>
  );
}

export function PumpGroupCard({ group }: { group: ExpoPumpGroup }) {
  const active = group.pumps.filter((pump) => pump.state === 'ON').length;
  return (
    <article className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Waves className="h-5 w-5 text-primary" /><h3 className="truncate text-base font-semibold">{group.label}</h3></div>
          <p className="mt-1 text-xs text-muted-foreground">{active} de {group.pumps.length} bombas ativas</p>
        </div>
        <StatusBadge label={group.coveragePct == null ? 'Sem dados' : `${group.coveragePct.toFixed(0)}% cobertura`} tone={group.coveragePct != null && group.coveragePct >= 90 ? 'ok' : 'warn'} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface p-3"><Gauge className="mb-2 h-4 w-4 text-primary" /><p className="text-[10px] uppercase text-muted-foreground">Pressão</p><p className="mt-1 text-sm font-semibold">{fmt(group.pressure, ' bar', 2)}</p></div>
        <div className="rounded-xl bg-surface p-3"><CircleGauge className="mb-2 h-4 w-4 text-primary" /><p className="text-[10px] uppercase text-muted-foreground">Setpoint</p><p className="mt-1 text-sm font-semibold">{fmt(group.pressureSetpoint, ' bar', 2)}</p></div>
        <div className="rounded-xl bg-surface p-3"><Fan className="mb-2 h-4 w-4 text-primary" /><p className="text-[10px] uppercase text-muted-foreground">Bypass</p><p className="mt-1 text-sm font-semibold">{fmt(group.bypassPct, '%', 0)}</p></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {group.pumps.map((pump) => (
          <div key={pump.id} className="rounded-xl border border-border bg-background px-3 py-2.5">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">{pump.label}</span><span className={cn('h-2 w-2 rounded-full', pump.state === 'ON' ? 'bg-success' : pump.state === 'OFF' ? 'bg-muted-foreground/35' : 'bg-warning')} /></div>
            <p className="mt-1 text-[10px] text-muted-foreground">{pump.remote == null ? 'Modo N/D' : pump.remote ? 'Remoto' : 'Local'} · {pump.alarm ? 'Alarme' : 'Sem alarme'}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function CoverageBar({ value }: { value: number | null }) {
  const width = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full', width >= 90 ? 'bg-success' : width >= 60 ? 'bg-warning' : 'bg-critical')} style={{ width: `${width}%` }} />
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
};

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
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 px-4 text-center text-sm text-muted-foreground">
        Sem série temporal disponível para o período selecionado. Ausência de amostra não é convertida em zero.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      {groups.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroup(group.id)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                activeGroup.id === group.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="h-[300px] min-w-0 w-full sm:h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={selectedData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis yAxisId="temp" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
            {hasCapacity ? <YAxis yAxisId="cap" orientation="right" domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} /> : null}
            <Tooltip contentStyle={tooltipStyle} />
            <Line yAxisId="temp" type="monotone" dataKey="inlet" name="Entrada °C" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls={false} />
            <Line yAxisId="temp" type="monotone" dataKey="outlet" name="Saída °C" stroke="var(--success)" strokeWidth={2} dot={false} connectNulls={false} />
            <Line yAxisId="temp" type="monotone" dataKey="deltaT" name="ΔT °C" stroke="var(--warning)" strokeWidth={2} dot={false} connectNulls={false} />
            {hasCapacity ? <Line yAxisId="cap" type="monotone" dataKey="capacity" name="Capacidade %" stroke="var(--purple)" strokeWidth={2} dot={false} connectNulls={false} /> : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WaterTrendChart({ data }: { data: ExpoTrendPoint[] }) {
  return (
    <div className="h-[280px] min-w-0 w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="waterConsumption" name="Consumo m³" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 2.5 }} connectNulls={false} />
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

export const expoMetricIcons = {
  temp: Thermometer,
  water: Droplets,
  gauge: Gauge,
  quality: Database,
};
