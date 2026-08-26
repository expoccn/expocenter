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

const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--foreground)',
  fontSize: 12,
};

const axisTick = { fill: 'var(--muted-foreground)', fontSize: 10 };

function hasValue(rows: Array<Record<string, unknown>>, keys: string[]) {
  return rows.some((row) => keys.some((key) => row[key] !== null && row[key] !== undefined));
}

function EmptyChart({ text = 'Sem dados suficientes para este gráfico.' }: { text?: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 px-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
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
    <div className="h-[290px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} unit=" h" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} h`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="operating" name="Operando" fill="var(--success)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="stopped" name="Parado" fill="var(--muted-foreground)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="alarm" name="Em alarme" fill="var(--critical)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerCapacityComparisonChart({ data }: { data: ExpoChillerCapacitySummary[] }) {
  const rows = data.map((item) => ({
    label: item.label.replace('Chiller ', ''),
    total: item.total,
    circuitA: item.circuitA,
    circuitB: item.circuitB,
  }));
  if (!hasValue(rows, ['total', 'circuitA', 'circuitB'])) return <EmptyChart />;
  return (
    <div className="h-[290px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}%`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="total" name="Total" fill="var(--primary)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="circuitA" name="Circuito A" fill="var(--success)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="circuitB" name="Circuito B" fill="var(--purple)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerWaterTrendChart({ data }: { data: ExpoChillerWaterTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['inlet', 'outlet', 'setpoint', 'deltaT'])) return <EmptyChart />;
  return (
    <div className="h-[320px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} unit="°" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(2).replace('.', ',')} °C`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="inlet" name="Entrada" stroke="var(--primary)" strokeWidth={2.3} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="outlet" name="Saída" stroke="var(--success)" strokeWidth={2.3} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="setpoint" name="Setpoint" stroke="var(--muted-foreground)" strokeWidth={1.7} strokeDasharray="5 4" dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="deltaT" name="ΔT" stroke="var(--warning)" strokeWidth={2} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerCapacityTrendChart({ data }: { data: ExpoChillerCapacityTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['total', 'circuitA', 'circuitB'])) return <EmptyChart />;
  return (
    <div className="h-[320px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}%`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="total" name="Total" stroke="var(--primary)" strokeWidth={2.4} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="circuitA" name="Circuito A" stroke="var(--success)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="circuitB" name="Circuito B" stroke="var(--purple)" strokeWidth={2} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChillerPressureTrendChart({ data }: { data: ExpoChillerPressureTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['suctionA', 'dischargeA', 'suctionB', 'dischargeB'])) return <EmptyChart />;
  return (
    <div className="h-[320px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="suctionA" name="Sucção A" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="dischargeA" name="Descarga A" stroke="var(--critical)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="suctionB" name="Sucção B" stroke="var(--success)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="dischargeB" name="Descarga B" stroke="var(--warning)" strokeWidth={2} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PumpPressureTrendChart({ data }: { data: ExpoPumpPressureTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['pressure', 'setpoint'])) return <EmptyChart />;
  return (
    <div className="h-[300px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(2).replace('.', ',')}`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="pressure" name="Pressão da linha" stroke="var(--primary)" strokeWidth={2.4} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="setpoint" name="Setpoint" stroke="var(--muted-foreground)" strokeWidth={1.8} strokeDasharray="5 4" dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PumpBypassTrendChart({ data }: { data: ExpoPumpBypassTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['bypass'])) return <EmptyChart />;
  return (
    <div className="h-[280px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}%`]} />
          <Line type="monotone" dataKey="bypass" name="Abertura bypass" stroke="var(--warning)" strokeWidth={2.4} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PumpActivityChart({ data }: { data: ExpoPumpActivityTrendPoint[] }) {
  if (!hasValue(data as unknown as Array<Record<string, unknown>>, ['bag1', 'bag2', 'bag3', 'bag4'])) return <EmptyChart />;
  return (
    <div className="h-[300px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(value) => value === 1 ? 'ON' : 'OFF'} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value) === 1 ? 'Ligada' : 'Desligada']} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
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
  const height = Math.max(280, rows.length * 42);
  return (
    <div style={{ height }} className="min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 14, left: 18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} unit=" m³" />
          <YAxis type="category" dataKey="label" width={132} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} m³`]} />
          <Bar dataKey="total" name="Consumo" fill="var(--primary)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WaterMixChart({ data }: { data: ExpoWaterAnalytics['mix'] }) {
  const rows = data.filter((item) => item.valueM3 !== null && Number(item.valueM3) > 0).map((item) => ({ name: item.label, value: item.valueM3 }));
  if (!rows.length) return <EmptyChart />;
  const colors = ['var(--primary)', 'var(--success)'];
  return (
    <div className="h-[290px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={64} outerRadius={96} paddingAngle={3}>
            {rows.map((row, index) => <Cell key={row.name} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} m³`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WaterTimeWindowChart({ data }: { data: ExpoWaterAnalytics['timeWindows'] }) {
  const rows = data.filter((item) => item.valueM3 !== null).map((item) => ({ label: item.label, value: item.valueM3 }));
  if (!rows.length) return <EmptyChart />;
  return (
    <div className="h-[280px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 10, left: -8, bottom: 28 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} unit=" m³" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} m³`]} />
          <Bar dataKey="value" name="Consumo" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopMetersChart({ data }: { data: ExpoWaterAnalytics['topMeters'] }) {
  const rows = data.filter((item) => item.consumptionM3 !== null).slice(0, 10).map((item) => ({ label: item.label, value: item.consumptionM3 }));
  if (!rows.length) return <EmptyChart />;
  const height = Math.max(320, rows.length * 38);
  return (
    <div style={{ height }} className="min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 14, left: 20, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} unit=" m³" />
          <YAxis type="category" dataKey="label" width={150} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} m³`]} />
          <Bar dataKey="value" name="Consumo" fill="var(--primary)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityCoverageChart({ data }: { data: Array<{ label: string; coveragePct: number | null }> }) {
  const rows = data.filter((item) => item.coveragePct !== null).map((item) => ({ label: item.label, value: item.coveragePct }));
  if (!rows.length) return <EmptyChart />;
  const height = Math.max(320, rows.length * 34);
  return (
    <div style={{ height }} className="min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 18, left: 18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <YAxis type="category" dataKey="label" width={150} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}%`]} />
          <Bar dataKey="value" name="Cobertura" fill="var(--primary)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityStatusDonut({ data }: { data: ExpoQualityAnalytics['statusBreakdown'] }) {
  const rows = data.filter((item) => item.count > 0).map((item) => ({ name: item.label, value: item.count, status: item.status }));
  if (!rows.length) return <EmptyChart />;
  const colors: Record<string, string> = {
    OK: 'var(--success)',
    DEGRADED: 'var(--warning)',
    NO_DATA: 'var(--muted-foreground)',
    COMM_ERROR: 'var(--critical)',
  };
  return (
    <div className="h-[320px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={68} outerRadius={102} paddingAngle={3}>
            {rows.map((row) => <Cell key={row.status} fill={colors[row.status] || 'var(--primary)'} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value)} fonte(s)`]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityAvailabilityHistoryChart({ data }: { data: ExpoQualityAnalytics['cagAvailabilityHistory'] }) {
  if (!data.some((item) => item.availabilityPct !== null)) return <EmptyChart text="Histórico diário de disponibilidade das fontes CAG ainda não disponível." />;
  return (
    <div className="h-[300px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={18} />
          <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}%`]} />
          <Line type="monotone" dataKey="availabilityPct" name="Fontes disponíveis" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 2.5 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
