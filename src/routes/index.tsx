import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowRight, Database, Droplets, Snowflake, Waves } from 'lucide-react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { MetricCard, CagTrendChart } from '@/components/dashboard/ExpoWidgets';
import { ChillerOperationChart, PavillionConsumptionChart, WaterMixChart } from '@/components/dashboard/AnalyticsCharts';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export const Route = createFileRoute('/')({ component: OverviewPage });

function OverviewPage() {
  return (
    <ExpoShell title="Visão Geral" description="Visão executiva da Central de Água Gelada, gestão hídrica e qualidade das fontes.">
      {(data) => {
        const operating = data.cag.chillers.filter((item) => item.state === 'OPERATING').length;
        const alarmed = data.cag.chillers.filter((item) => item.alarmCode && item.alarmCode !== '0').length;
        const commErrors = data.water.meters.filter((item) => item.status === 'COMM_ERROR').length;
        const avgCapacity = data.cag.chillers.filter((item) => item.state === 'OPERATING' && item.capacityPct != null);
        const avgCapacityValue = avgCapacity.length ? avgCapacity.reduce((sum, item) => sum + Number(item.capacityPct), 0) / avgCapacity.length : null;
        const cagAnalytics = data.cag.analytics;
        const waterAnalytics = data.water.analytics;

        return (
          <>
            <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Chillers operando" value={`${operating}/3`} detail="Equipamentos com evidência de operação." tone={operating ? 'ok' : 'info'} icon={Snowflake} />
              <MetricCard label="Capacidade média" value={avgCapacityValue == null ? 'N/D' : `${avgCapacityValue.toFixed(1).replace('.', ',')}%`} detail="Entre chillers identificados como operando." tone="info" icon={Waves} />
              <MetricCard label="Alarmes ativos" value={String(alarmed)} detail="Códigos exibidos sem inferir causa raiz." tone={alarmed ? 'crit' : 'ok'} icon={AlertTriangle} />
              <MetricCard label="Cobertura geral" value={data.quality.overallCoveragePct == null ? 'N/D' : `${data.quality.overallCoveragePct.toFixed(1).replace('.', ',')}%`} detail="Amostras válidas do período." tone={(data.quality.overallCoveragePct ?? 0) >= 90 ? 'ok' : 'warn'} icon={Database} />
              <MetricCard label="Consumo de água" value={data.water.totalM3 == null ? 'N/D' : `${data.water.totalM3.toFixed(1).replace('.', ',')} m³`} detail={`${commErrors} hidrômetro(s) sem comunicação.`} tone={commErrors ? 'warn' : 'ok'} icon={Droplets} />
            </section>

            <section className="grid min-w-0 gap-3.5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
              <Panel title="Horas de operação dos chillers" icon={Snowflake}><ChillerOperationChart data={cagAnalytics?.chillerOperation || []} /></Panel>
              <Panel title="Composição do consumo hídrico" icon={Droplets}><WaterMixChart data={waterAnalytics?.mix || []} /></Panel>
            </section>

            <section className="grid min-w-0 gap-3.5 2xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.72fr)_minmax(290px,0.58fr)]">
              <Panel title="Tendência de água gelada" icon={Waves} action={<Link to="/cag" className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">Abrir CAG <ArrowRight className="h-3 w-3" /></Link>}>
                <CagTrendChart data={data.cag.trends} />
              </Panel>

              <Panel title="Consumo por pavilhão" icon={Droplets}>
                <PavillionConsumptionChart data={waterAnalytics?.pavillions || []} />
              </Panel>

              <Panel title="Pontos de atenção" icon={AlertTriangle} className="min-w-0">
                <div className="space-y-2">
                  {data.attention.length ? data.attention.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-xl border border-border/80 bg-surface/45 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-foreground">{item.title}</p>
                        <StatusBadge label={item.source} tone={item.tone} />
                      </div>
                      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p>
                    </div>
                  )) : <p className="rounded-xl border border-dashed border-border p-4 text-[11px] text-muted-foreground">Sem pontos de atenção registrados para o período.</p>}
                </div>
              </Panel>
            </section>
          </>
        );
      }}
    </ExpoShell>
  );
}
