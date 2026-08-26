import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowRight, Database, Droplets, Snowflake, Waves } from 'lucide-react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { MetricCard, ChillerCard, CagTrendChart } from '@/components/dashboard/ExpoWidgets';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export const Route = createFileRoute('/')({ component: OverviewPage });

function OverviewPage() {
  return (
    <ExpoShell
      title="Visão Geral"
      description="Visão consolidada da Central de Água Gelada, gestão hídrica e qualidade das fontes do Expo Center Norte."
    >
      {(data) => {
        const operating = data.cag.chillers.filter((item) => item.state === 'OPERATING').length;
        const alarmed = data.cag.chillers.filter((item) => item.alarmCode && item.alarmCode !== '0').length;
        const commErrors = data.water.meters.filter((item) => item.status === 'COMM_ERROR').length;
        const avgCapacity = data.cag.chillers.filter((item) => item.state === 'OPERATING' && item.capacityPct != null);
        const avgCapacityValue = avgCapacity.length
          ? avgCapacity.reduce((sum, item) => sum + Number(item.capacityPct), 0) / avgCapacity.length
          : null;

        return (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Chillers operando" value={`${operating}/3`} detail="Equipamentos com evidência de operação no período." tone={operating ? 'ok' : 'info'} icon={Snowflake} />
              <MetricCard label="Capacidade em operação" value={avgCapacityValue == null ? 'N/D' : `${avgCapacityValue.toFixed(1).replace('.', ',')}%`} detail="Média apenas entre chillers identificados como operando." tone="info" icon={Waves} />
              <MetricCard label="Alarmes observados" value={String(alarmed)} detail="Códigos exibidos sem inferir causa raiz." tone={alarmed ? 'warn' : 'ok'} icon={AlertTriangle} />
              <MetricCard label="Cobertura geral" value={data.quality.overallCoveragePct == null ? 'N/D' : `${data.quality.overallCoveragePct.toFixed(1).replace('.', ',')}%`} detail="Ausência de amostra nunca é convertida em zero." tone={(data.quality.overallCoveragePct ?? 0) >= 90 ? 'ok' : 'warn'} icon={Database} />
              <MetricCard label="Consumo de água" value={data.water.totalM3 == null ? 'N/D' : `${data.water.totalM3.toFixed(1).replace('.', ',')} m³`} detail={`${commErrors} hidrômetro(s) com falha de comunicação no período.`} tone={commErrors ? 'warn' : 'ok'} icon={Droplets} />
            </section>

            <section className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="min-w-0 space-y-4">
                <div className="grid min-w-0 gap-4 xl:grid-cols-3">
                  {data.cag.chillers.map((chiller) => <ChillerCard key={chiller.id} chiller={chiller} />)}
                </div>

                <Panel title="Tendência operacional consolidada" icon={Waves} action={<Link to="/cag" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Abrir CAG <ArrowRight className="h-3.5 w-3.5" /></Link>}>
                  <CagTrendChart data={data.cag.trends} />
                </Panel>
              </div>

              <Panel title="Pontos de atenção" icon={AlertTriangle} className="min-w-0">
                <div className="space-y-3">
                  {data.attention.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-surface/50 p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">{item.title}</p>
                        <StatusBadge label={item.source} tone={item.tone} />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <Link to="/cag" className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                <div className="flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Snowflake className="h-5 w-5" /></span><div><p className="font-semibold">Central de Água Gelada</p><p className="text-xs text-muted-foreground">Chillers, bombas, pressões e tendências</p></div></div>
              </Link>
              <Link to="/hidrometros" className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                <div className="flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Droplets className="h-5 w-5" /></span><div><p className="font-semibold">Gestão Hídrica</p><p className="text-xs text-muted-foreground">Potável, reúso, pavimentos e qualidade</p></div></div>
              </Link>
              <Link to="/qualidade-dados" className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                <div className="flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Database className="h-5 w-5" /></span><div><p className="font-semibold">Qualidade dos Dados</p><p className="text-xs text-muted-foreground">Cobertura, comunicação e lacunas</p></div></div>
              </Link>
            </section>
          </>
        );
      }}
    </ExpoShell>
  );
}
