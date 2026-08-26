import { createFileRoute } from '@tanstack/react-router';
import { Droplets, Gauge, Moon, Recycle, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { MetricCard, SourceStatusIcon, WaterTrendChart } from '@/components/dashboard/ExpoWidgets';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/hidrometros')({ component: WaterPage });

type WaterTab = 'overview' | 'pavillions' | 'meters' | 'quality';
const tabs: Array<{ id: WaterTab; label: string }> = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'pavillions', label: 'Pavilhões' },
  { id: 'meters', label: 'Hidrômetros' },
  { id: 'quality', label: 'Qualidade' },
];

function WaterPage() {
  const [tab, setTab] = useState<WaterTab>('overview');
  const [search, setSearch] = useState('');

  return (
    <ExpoShell title="Hidrômetros" description="Gestão hídrica com consumo potável e reúso, qualidade das leituras e estrutura pronta para demonstrativos Cliente/Técnico.">
      {(data) => {
        type PavillionSummary = { name: string; total: number | null; potable: number | null; reuse: number | null; issues: number; validMeters: number };
        const groupedRecord = data.water.meters.reduce<Record<string, PavillionSummary>>((acc, meter) => {
          const current = acc[meter.pavillion] ?? { name: meter.pavillion, total: null, potable: null, reuse: null, issues: 0, validMeters: 0 };
          if (meter.consumptionM3 != null) {
            current.total = (current.total ?? 0) + meter.consumptionM3;
            if (meter.type === 'REUSO') current.reuse = (current.reuse ?? 0) + meter.consumptionM3;
            else current.potable = (current.potable ?? 0) + meter.consumptionM3;
            current.validMeters += 1;
          }
          if (meter.status !== 'OK') current.issues += 1;
          acc[meter.pavillion] = current;
          return acc;
        }, {});
        const grouped = Object.values(groupedRecord).sort((a, b) => (b.total ?? -1) - (a.total ?? -1));

        const filteredMeters = data.water.meters.filter((meter) => `${meter.label} ${meter.pavillion} ${meter.type}`.toLowerCase().includes(search.toLowerCase().trim()));
        const commErrors = data.water.meters.filter((meter) => meter.status === 'COMM_ERROR').length;

        return (
          <>
            <div className="dashboard-scrollbar overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 rounded-2xl border border-border bg-card p-2">
                {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn('rounded-xl px-4 py-2 text-xs font-semibold transition-colors', tab === item.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>{item.label}</button>)}
              </div>
            </div>

            {tab === 'overview' ? (
              <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricCard label="Consumo total" value={data.water.totalM3 == null ? 'N/D' : `${data.water.totalM3.toFixed(1).replace('.', ',')} m³`} detail="Volume ajustado conforme regras de qualidade." tone="info" icon={Droplets} />
                  <MetricCard label="Água potável" value={data.water.potableM3 == null ? 'N/D' : `${data.water.potableM3.toFixed(1).replace('.', ',')} m³`} detail="Consumo dos medidores classificados como potável." tone="info" icon={Gauge} />
                  <MetricCard label="Reúso" value={data.water.reuseM3 == null ? 'N/D' : `${data.water.reuseM3.toFixed(1).replace('.', ',')} m³`} detail={data.water.reusePct == null ? 'Participação N/D' : `${data.water.reusePct.toFixed(1).replace('.', ',')}% do volume válido.`} tone="ok" icon={Recycle} />
                  <MetricCard label="Janela 10h–18h" value={data.water.window1018M3 == null ? 'N/D' : `${data.water.window1018M3.toFixed(1).replace('.', ',')} m³`} detail="Indicador preservado do relatório histórico de água." tone="info" icon={Droplets} />
                  <MetricCard label="Consumo noturno" value={data.water.nightM3 == null ? 'N/D' : `${data.water.nightM3.toFixed(1).replace('.', ',')} m³`} detail={`${commErrors} medidor(es) com falha de comunicação.`} tone={commErrors ? 'warn' : 'ok'} icon={Moon} />
                </section>
                <Panel title="Perfil de consumo" icon={Droplets}><WaterTrendChart data={data.water.trends} /></Panel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {grouped.slice(0, 6).map((pav) => (
                    <div key={pav.name} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{pav.name}</h3><StatusBadge label={pav.issues ? `${pav.issues} atenção` : 'Normal'} tone={pav.issues ? 'warn' : 'ok'} /></div>
                      <p className="mt-4 text-2xl font-semibold">{pav.total == null ? 'N/D' : `${pav.total.toFixed(1).replace('.', ',')} m³`}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-surface p-3"><span className="text-muted-foreground">Potável</span><p className="mt-1 font-semibold">{pav.potable == null ? 'N/D' : `${pav.potable.toFixed(1).replace('.', ',')} m³`}</p></div><div className="rounded-xl bg-surface p-3"><span className="text-muted-foreground">Reúso</span><p className="mt-1 font-semibold">{pav.reuse == null ? 'N/D' : `${pav.reuse.toFixed(1).replace('.', ',')} m³`}</p></div></div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {tab === 'pavillions' ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {grouped.map((pav) => (
                  <div key={pav.name} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{pav.name}</h3><StatusBadge label={pav.issues ? 'Atenção' : 'OK'} tone={pav.issues ? 'warn' : 'ok'} /></div>
                    <p className="mt-4 text-3xl font-semibold">{pav.total == null ? 'N/D' : pav.total.toFixed(1).replace('.', ',')} {pav.total == null ? null : <span className="text-base font-medium text-muted-foreground">m³</span>}</p>
                    <div className="mt-4 space-y-2 text-xs text-muted-foreground"><div className="flex justify-between gap-4"><span>Potável</span><strong className="text-foreground">{pav.potable == null ? 'N/D' : `${pav.potable.toFixed(1).replace('.', ',')} m³`}</strong></div><div className="flex justify-between gap-4"><span>Reúso</span><strong className="text-foreground">{pav.reuse == null ? 'N/D' : `${pav.reuse.toFixed(1).replace('.', ',')} m³`}</strong></div></div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'meters' ? (
              <Panel title="Hidrômetros monitorados" icon={Droplets} action={<div className="relative w-[min(58vw,260px)]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar hidrômetro" className="h-9 pl-9" /></div>}>
                <div className="dashboard-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead><tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">Hidrômetro</th><th className="px-3 py-2.5">Pavilhão</th><th className="px-3 py-2.5">Tipo</th><th className="px-3 py-2.5 text-right">Consumo</th><th className="px-3 py-2.5 text-right">Última leitura</th><th className="px-3 py-2.5">Cobertura</th><th className="px-3 py-2.5">Status</th></tr></thead>
                    <tbody>{filteredMeters.map((meter) => <tr key={meter.id} className="border-b border-border/60 last:border-0"><td className="px-3 py-3 font-medium">{meter.label}</td><td className="px-3 py-3 text-muted-foreground">{meter.pavillion}</td><td className="px-3 py-3"><StatusBadge label={meter.type === 'REUSO' ? 'Reúso' : 'Potável'} tone={meter.type === 'REUSO' ? 'ok' : 'info'} /></td><td className="px-3 py-3 text-right font-semibold">{meter.consumptionM3 == null ? 'N/D' : `${meter.consumptionM3.toFixed(1).replace('.', ',')} m³`}</td><td className="px-3 py-3 text-right">{meter.lastReadingM3 == null ? 'N/D' : meter.lastReadingM3.toLocaleString('pt-BR')}</td><td className="px-3 py-3">{meter.coveragePct == null ? 'N/D' : `${meter.coveragePct.toFixed(0)}%`}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><SourceStatusIcon status={meter.status === 'ANOMALY' ? 'DEGRADED' : meter.status} /><span>{meter.status === 'OK' ? 'OK' : meter.status === 'COMM_ERROR' ? 'Sem comunicação' : meter.status === 'ANOMALY' ? 'Anomalia' : 'Sem dados'}</span></div></td></tr>)}</tbody>
                  </table>
                </div>
              </Panel>
            ) : null}

            {tab === 'quality' ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.water.meters.map((meter) => (
                  <div key={meter.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{meter.label}</h3><p className="mt-1 text-xs text-muted-foreground">{meter.pavillion}</p></div><SourceStatusIcon status={meter.status === 'ANOMALY' ? 'DEGRADED' : meter.status} /></div>
                    <p className="mt-4 text-2xl font-semibold">{meter.coveragePct == null ? 'N/D' : `${meter.coveragePct.toFixed(0)}%`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Cobertura da fonte</p>
                    {meter.note ? <p className="mt-3 rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted-foreground">{meter.note}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        );
      }}
    </ExpoShell>
  );
}
