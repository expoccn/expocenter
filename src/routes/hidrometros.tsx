import { createFileRoute } from '@tanstack/react-router';
import { Droplets, Gauge, Moon, Recycle, Search } from 'lucide-react';
import { useState } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { MetricCard, SourceStatusIcon, WaterTrendChart } from '@/components/dashboard/ExpoWidgets';
import {
  PavillionConsumptionChart,
  TopMetersChart,
  WaterMixChart,
  WaterTimeWindowChart,
} from '@/components/dashboard/AnalyticsCharts';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Input } from '@/components/ui/input';

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
    <ExpoShell title="Hidrômetros" description="Gestão hídrica com consumo potável e reúso, ranking por pavilhão e hidrômetro, perfil temporal e qualidade das leituras.">
      {(data) => {
        const analytics = data.water.analytics;
        const pavillions = analytics?.pavillions || [];
        const filteredMeters = data.water.meters.filter((meter) => `${meter.label} ${meter.pavillion} ${meter.type}`.toLowerCase().includes(search.toLowerCase().trim()));
        const commErrors = data.water.meters.filter((meter) => meter.status === 'COMM_ERROR').length;

        return (
          <>
            <div className="dashboard-scrollbar overflow-x-auto pb-0.5">
              <div className="expo-segmented">
                {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} data-active={tab === item.id} className="expo-segmented-button">{item.label}</button>)}
              </div>
            </div>

            {tab === 'overview' ? (
              <>
                <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricCard label="Consumo total" value={data.water.totalM3 == null ? 'N/D' : `${data.water.totalM3.toFixed(1).replace('.', ',')} m³`} detail="Volume ajustado conforme regras de qualidade." tone="info" icon={Droplets} />
                  <MetricCard label="Água potável" value={data.water.potableM3 == null ? 'N/D' : `${data.water.potableM3.toFixed(1).replace('.', ',')} m³`} detail="Consumo dos medidores classificados como potável." tone="info" icon={Gauge} />
                  <MetricCard label="Reúso" value={data.water.reuseM3 == null ? 'N/D' : `${data.water.reuseM3.toFixed(1).replace('.', ',')} m³`} detail={data.water.reusePct == null ? 'Participação N/D' : `${data.water.reusePct.toFixed(1).replace('.', ',')}% do volume válido.`} tone="ok" icon={Recycle} />
                  <MetricCard label="Janela 10h–18h" value={data.water.window1018M3 == null ? 'N/D' : `${data.water.window1018M3.toFixed(1).replace('.', ',')} m³`} detail="Consumo acumulado nessa janela horária." tone="info" icon={Droplets} />
                  <MetricCard label="Consumo noturno" value={data.water.nightM3 == null ? 'N/D' : `${data.water.nightM3.toFixed(1).replace('.', ',')} m³`} detail={`${commErrors} medidor(es) com falha de comunicação.`} tone={commErrors ? 'warn' : 'ok'} icon={Moon} />
                </section>

                <section className="grid min-w-0 gap-3.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
                  <Panel title="Perfil diário de consumo" icon={Droplets}><WaterTrendChart data={data.water.trends} /></Panel>
                  <Panel title="Potável × Reúso" icon={Recycle}><WaterMixChart data={analytics?.mix || []} /></Panel>
                </section>

                <section className="grid min-w-0 gap-3.5 xl:grid-cols-2">
                  <Panel title="Consumo por pavilhão" icon={Droplets}><PavillionConsumptionChart data={pavillions} /></Panel>
                  <Panel title="Consumo por janela horária" icon={Moon}><WaterTimeWindowChart data={analytics?.timeWindows || []} /></Panel>
                </section>

                <Panel title="Maiores consumos por hidrômetro" icon={Gauge}><TopMetersChart data={analytics?.topMeters || []} /></Panel>
              </>
            ) : null}

            {tab === 'pavillions' ? (
              <>
                <Panel title="Ranking de consumo por pavilhão" icon={Droplets}><PavillionConsumptionChart data={pavillions} /></Panel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {pavillions.map((pav) => (
                    <div key={pav.id} className="expo-panel rounded-[14px] p-4">
                      <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{pav.label}</h3><StatusBadge label={pav.attentionMeters ? 'Atenção' : 'OK'} tone={pav.attentionMeters ? 'warn' : 'ok'} /></div>
                      <p className="mt-4 text-3xl font-semibold">{pav.totalM3 == null ? 'N/D' : pav.totalM3.toFixed(1).replace('.', ',')} {pav.totalM3 == null ? null : <span className="text-base font-medium text-muted-foreground">m³</span>}</p>
                      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between gap-4"><span>Potável</span><strong className="text-foreground">{pav.potableM3 == null ? 'N/D' : `${pav.potableM3.toFixed(1).replace('.', ',')} m³`}</strong></div>
                        <div className="flex justify-between gap-4"><span>Reúso</span><strong className="text-foreground">{pav.reuseM3 == null ? 'N/D' : `${pav.reuseM3.toFixed(1).replace('.', ',')} m³`}</strong></div>
                        <div className="flex justify-between gap-4"><span>Medidores válidos</span><strong className="text-foreground">{pav.validMeters}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {tab === 'meters' ? (
              <>
                <Panel title="Ranking dos hidrômetros" icon={Gauge}><TopMetersChart data={analytics?.topMeters || []} /></Panel>
                <Panel title="Hidrômetros monitorados" icon={Droplets} action={<div className="relative w-[min(58vw,260px)]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar hidrômetro" className="h-9 pl-9" /></div>}>
                  <div className="dashboard-scrollbar overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead><tr className="border-b border-border bg-surface/55 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><th className="px-3 py-2.5">Hidrômetro</th><th className="px-3 py-2.5">Pavilhão</th><th className="px-3 py-2.5">Tipo</th><th className="px-3 py-2.5 text-right">Consumo</th><th className="px-3 py-2.5 text-right">Última leitura</th><th className="px-3 py-2.5">Cobertura</th><th className="px-3 py-2.5">Status</th></tr></thead>
                      <tbody>{filteredMeters.map((meter) => <tr key={meter.id} className="border-b border-border/60 last:border-0"><td className="px-3 py-3 font-medium">{meter.label}</td><td className="px-3 py-3 text-muted-foreground">{meter.pavillion}</td><td className="px-3 py-3"><StatusBadge label={meter.type === 'REUSO' ? 'Reúso' : 'Potável'} tone={meter.type === 'REUSO' ? 'ok' : 'info'} /></td><td className="px-3 py-3 text-right font-semibold">{meter.consumptionM3 == null ? 'N/D' : `${meter.consumptionM3.toFixed(1).replace('.', ',')} m³`}</td><td className="px-3 py-3 text-right">{meter.lastReadingM3 == null ? 'N/D' : meter.lastReadingM3.toLocaleString('pt-BR')}</td><td className="px-3 py-3">{meter.coveragePct == null ? 'N/D' : `${meter.coveragePct.toFixed(0)}%`}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><SourceStatusIcon status={meter.status === 'ANOMALY' ? 'DEGRADED' : meter.status} /><span>{meter.status === 'OK' ? 'OK' : meter.status === 'COMM_ERROR' ? 'Sem comunicação' : meter.status === 'ANOMALY' ? 'Anomalia' : 'Sem dados'}</span></div></td></tr>)}</tbody>
                    </table>
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === 'quality' ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.water.meters.map((meter) => (
                  <div key={meter.id} className="expo-panel rounded-[14px] p-4">
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
