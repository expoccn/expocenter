import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  ExpoChillerCapacitySummary,
  ExpoChillerCapacityTrendPoint,
  ExpoChillerOperationSummary,
  ExpoChillerPressureTrendPoint,
  ExpoChillerWaterTrendPoint,
  ExpoPumpActivityTrendPoint,
  ExpoPumpBypassTrendPoint,
  ExpoPumpPressureTrendPoint,
  ExpoQualityAnalytics,
  ExpoWaterAnalytics,
} from '@/types/expo';
import { ExpoChartTooltip } from '@/components/dashboard/ChartTooltip';

const axisTick = { fill: 'var(--muted-foreground)', fontSize: 10 };
const legendStyle = { fontSize: 10, color: 'var(--muted-foreground)' };

function hasValue(rows: Array<Record<string, unknown>>, keys: string[]) {
  return rows.some((row) => keys.some((key) => row[key] !== null && row[key] !== undefined));
}

function EmptyChart({ text = 'Sem dados suficientes para este gráfico.' }: { text?: string }) {
  return <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 px-6 text-center text-[12px] text-muted-foreground">{text}</div>;
}

function formatNumber(value: number | string | null | undefined, suffix = '', digits = 1) {
  if (value == null || value === '') return 'N/D';
  return `${Number(value).toFixed(digits).replace('.', ',')}${suffix}`;
}

export function ChillerOperationChart({ data }: { data: ExpoChillerOperationSummary[] }) {
  const rows = data.map((item) => ({
    label: item.label.replace('Chiller ', ''),
    operating: item.operatingHours,
    stopped: item.stoppedHours,
    alarm: item.alarmHours,
  }));
  if (!hasValue(rows, ['operating', 'stopped', 'alarm'])) return <EmptyChart />;
  return (
    <div className="h-[260px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} unit=" h" />
          <YAxis type="category" dataKey="label" width={62} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, ' h')} />} />
          <Legend wrapperStyle={legendStyle} />
          <Bar dataKey="operating" name="Operando" stackId="hours" fill="var(--success)" radius={[5, 0, 0, 5]} />
          <Bar dataKey="stopped" name="Parado" stackId="hours" fill="var(--muted-foreground)" />
          <Bar dataKey="alarm" name="Em alarme" stackId="hours" fill="var(--critical)" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerCapacityComparisonChart({ data }: { data: ExpoChillerCapacitySummary[] }) {
  const rows = data.map((item) => ({ label: item.label.replace('Chiller ', ''), total: item.total, circuitA: item.circuitA, circuitB: item.circuitB }));
  if (!hasValue(rows, ['total', 'circuitA', 'circuitB'])) return <EmptyChart />;
  return (
    <div className="h-[260px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '%')} />} />
          <Legend wrapperStyle={legendStyle} />
          <Bar dataKey="total" name="Total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="circuitA" name="Circuito A" fill="var(--success)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="circuitB" name="Circuito B" fill="var(--purple)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerWaterTrendChart({ data }: { data: ExpoChillerWaterTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['inlet', 'outlet', 'setpoint', 'deltaT'])) return <EmptyChart />;
  return (
    <div className="h-[285px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} unit="°" />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, ' °C', 2)} />} />
          <Legend wrapperStyle={legendStyle} />
          <Line type="monotone" dataKey="inlet" name="Entrada" stroke="var(--primary)" strokeWidth={2.2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="outlet" name="Saída" stroke="var(--success)" strokeWidth={2.2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="setpoint" name="Setpoint" stroke="var(--muted-foreground)" strokeWidth={1.6} strokeDasharray="5 4" dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="deltaT" name="ΔT" stroke="var(--warning)" strokeWidth={1.9} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerCapacityTrendChart({ data }: { data: ExpoChillerCapacityTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['total', 'circuitA', 'circuitB'])) return <EmptyChart />;
  return (
    <div className="h-[285px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '%')} />} />
          <Legend wrapperStyle={legendStyle} />
          <Line type="monotone" dataKey="total" name="Total" stroke="var(--primary)" strokeWidth={2.3} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="circuitA" name="Circuito A" stroke="var(--success)" strokeWidth={1.9} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="circuitB" name="Circuito B" stroke="var(--purple)" strokeWidth={1.9} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerPressureTrendChart({ data }: { data: ExpoChillerPressureTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['suctionA', 'dischargeA', 'suctionB', 'dischargeB'])) return <EmptyChart />;
  return (
    <div className="h-[285px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '', 1)} />} />
          <Legend wrapperStyle={legendStyle} />
          <Line type="monotone" dataKey="suctionA" name="Sucção A" stroke="var(--primary)" strokeWidth={1.9} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="dischargeA" name="Descarga A" stroke="var(--critical)" strokeWidth={1.9} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="suctionB" name="Sucção B" stroke="var(--success)" strokeWidth={1.9} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="dischargeB" name="Descarga B" stroke="var(--warning)" strokeWidth={1.9} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PumpPressureTrendChart({ data }: { data: ExpoPumpPressureTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['pressure', 'setpoint'])) return <EmptyChart />;
  return (
    <div className="h-[265px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '', 2)} />} />
          <Legend wrapperStyle={legendStyle} />
          <Line type="monotone" dataKey="pressure" name="Pressão da linha" stroke="var(--primary)" strokeWidth={2.3} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="setpoint" name="Setpoint" stroke="var(--muted-foreground)" strokeWidth={1.7} strokeDasharray="5 4" dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PumpBypassTrendChart({ data }: { data: ExpoPumpBypassTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['bypass'])) return <EmptyChart />;
  return (
    <div className="h-[250px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '%')} />} />
          <Line type="monotone" dataKey="bypass" name="Abertura bypass" stroke="var(--purple)" strokeWidth={2.3} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PumpActivityChart({ data }: { data: ExpoPumpActivityTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['bag1', 'bag2', 'bag3', 'bag4'])) return <EmptyChart />;
  return (
    <div className="h-[255px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(value) => value === 1 ? 'ON' : 'OFF'} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => Number(value) === 1 ? 'Ligada' : 'Desligada'} />} />
          <Legend wrapperStyle={legendStyle} />
          <Line type="stepAfter" dataKey="bag1" name="BAG 1" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="stepAfter" dataKey="bag2" name="BAG 2" stroke="var(--success)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="stepAfter" dataKey="bag3" name="BAG 3" stroke="var(--warning)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="stepAfter" dataKey="bag4" name="BAG 4" stroke="var(--purple)" strokeWidth={2} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PavillionConsumptionChart({ data }: { data: ExpoWaterAnalytics['pavillions'] }) {
  const rows = data.filter((item) => item.totalM3 !== null).map((item) => ({ label: item.label, total: item.totalM3 }));
  if (!rows.length) return <EmptyChart />;
  const height = Math.max(245, rows.length * 36);
  return (
    <div style={{ height }} className="min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 14, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} unit=" m³" />
          <YAxis type="category" dataKey="label" width={122} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, ' m³')} />} />
          <Bar dataKey="total" name="Consumo" fill="var(--primary)" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WaterMixChart({ data }: { data: ExpoWaterAnalytics['mix'] }) {
  const rows = data.filter((item) => item.valueM3 !== null && Number(item.valueM3) > 0).map((item) => ({ name: item.label, value: Number(item.valueM3) }));
  if (!rows.length) return <EmptyChart />;
  const colors = ['var(--primary)', 'var(--success)'];
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <div className="grid min-w-0 items-center gap-2 sm:grid-cols-[minmax(180px,0.9fr)_minmax(150px,0.7fr)]">
      <div className="relative h-[230px] min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={2.5} stroke="var(--card)" strokeWidth={2}>
              {rows.map((row, index) => <Cell key={row.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, ' m³')} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center"><p className="text-lg font-semibold tracking-tight text-foreground">{formatNumber(total, ' m³')}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</p></div>
        </div>
      </div>
      <div className="space-y-3 px-2 pb-3 sm:pb-0">
        {rows.map((row, index) => {
          const pct = total > 0 ? (row.value / total) * 100 : 0;
          return <div key={row.name} className="flex items-start gap-2.5"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><div className="min-w-0"><p className="text-[11px] font-semibold text-foreground">{row.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{formatNumber(row.value, ' m³')} · {formatNumber(pct, '%')}</p></div></div>;
        })}
      </div>
    </div>
  );
}

export function WaterTimeWindowChart({ data }: { data: ExpoWaterAnalytics['timeWindows'] }) {
  const rows = data.filter((item) => item.valueM3 !== null).map((item) => ({ label: item.label, value: item.valueM3 }));
  if (!rows.length) return <EmptyChart />;
  return (
    <div className="h-[245px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 10, left: -8, bottom: 28 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} unit=" m³" />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, ' m³')} />} />
          <Bar dataKey="value" name="Consumo" fill="var(--primary)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopMetersChart({ data }: { data: ExpoWaterAnalytics['topMeters'] }) {
  const rows = data.filter((item) => item.consumptionM3 !== null).slice(0, 10).map((item) => ({ label: item.label, value: item.consumptionM3 }));
  if (!rows.length) return <EmptyChart />;
  const height = Math.max(285, rows.length * 32);
  return (
    <div style={{ height }} className="min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 14, left: 20, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} unit=" m³" />
          <YAxis type="category" dataKey="label" width={145} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, ' m³')} />} />
          <Bar dataKey="value" name="Consumo" fill="var(--primary)" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityCoverageChart({ data }: { data: Array<{ label: string; coveragePct: number | null }> }) {
  const rows = data.filter((item) => item.coveragePct !== null).map((item) => ({ label: item.label, value: item.coveragePct }));
  if (!rows.length) return <EmptyChart />;
  const height = Math.max(270, rows.length * 29);
  return (
    <div style={{ height }} className="min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 18, left: 12, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <YAxis type="category" dataKey="label" width={140} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '%')} />} />
          <Bar dataKey="value" name="Cobertura" fill="var(--success)" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityStatusDonut({ data }: { data: ExpoQualityAnalytics['statusBreakdown'] }) {
  const rows = data.filter((item) => item.count > 0).map((item) => ({ name: item.label, value: item.count, status: item.status }));
  if (!rows.length) return <EmptyChart />;
  const colors: Record<string, string> = { OK: 'var(--success)', DEGRADED: 'var(--warning)', NO_DATA: 'var(--muted-foreground)', COMM_ERROR: 'var(--critical)' };
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <div className="relative h-[275px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={58} outerRadius={86} paddingAngle={2.5} stroke="var(--card)" strokeWidth={2}>
            {rows.map((row) => <Cell key={row.status} fill={colors[row.status] || 'var(--primary)'} />)}
          </Pie>
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => `${Number(value)} fonte(s)`} />} />
          <Legend wrapperStyle={legendStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[91px] text-center"><p className="text-lg font-semibold text-foreground">{total}</p><p className="text-[8px] uppercase tracking-[0.12em] text-muted-foreground">fontes</p></div>
    </div>
  );
}

export function QualityAvailabilityHistoryChart({ data }: { data: ExpoQualityAnalytics['cagAvailabilityHistory'] }) {
  if (!data.some((item) => item.availabilityPct !== null)) return <EmptyChart text="Histórico diário de disponibilidade das fontes CAG ainda não disponível." />;
  return (
    <div className="h-[260px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={18} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip content={<ExpoChartTooltip valueFormatter={(value) => formatNumber(value, '%')} />} />
          <Line type="monotone" dataKey="availabilityPct" name="Fontes disponíveis" stroke="var(--primary)" strokeWidth={2.3} dot={{ r: 2.2 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
