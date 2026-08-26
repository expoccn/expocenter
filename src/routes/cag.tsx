import { createFileRoute } from '@tanstack/react-router';
import { Activity, CircleGauge, Gauge, Snowflake, Waves } from 'lucide-react';
import { useState } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { ChillerCard, MetricCard, PumpGroupCard } from '@/components/dashboard/ExpoWidgets';
import {
  ChillerCapacityComparisonChart,
  ChillerCapacityTrendChart,
  ChillerOperationChart,
  ChillerPressureTrendChart,
  ChillerWaterTrendChart,
  PumpActivityChart,
  PumpBypassTrendChart,
  PumpPressureTrendChart,
} from '@/components/dashboard/AnalyticsCharts';
import { Panel } from '@/components/dashboard/Panel';
import { cn } from '@/lib/utils';
import type { ExpoCagGroupId } from '@/types/expo';

export const Route = createFileRoute('/cag')({ component: CagPage });

type CagTab = 'overview' | 'chillers' | 'pumps' | 'trends';
type TrendContext = 'water' | 'capacity' | 'pressures' | 'pumps';

const tabs: Array<{ id: CagTab; label: string }> = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'chillers', label: 'Chillers' },
  { id: 'pumps', label: 'Bombas & Hidráulica' },
  { id: 'trends', label: 'Tendências' },
];

const groups: Array<{ id: ExpoCagGroupId; label: string }> = [
  { id: 'azul', label: 'Azul' },
  { id: 'branco', label: 'Branco' },
  { id: 'vermelho', label: 'Vermelho' },
];

function Selector({ value, onChange }: { value: ExpoCagGroupId; onChange: (value: ExpoCagGroupId) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group) => (
        <button key={group.id} type="button" onClick={() => onChange(group.id)} className={cn('rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors', value === group.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground')}>
          {group.label}
        </button>
      ))}
    </div>
  );
}

function CagPage() {
  const [tab, setTab] = useState<CagTab>('overview');
  const [chillerGroup, setChillerGroup] = useState<ExpoCagGroupId>('azul');
  const [pumpGroup, setPumpGroup] = useState<ExpoCagGroupId>('azul');
  const [trendGroup, setTrendGroup] = useState<ExpoCagGroupId>('azul');
  const [trendContext, setTrendContext] = useState<TrendContext>('water');

  return (
    <ExpoShell
      title="Central de Água Gelada"
      description="Análise dos chillers Azul, Branco e Vermelho e dos respectivos grupos de bombas. As séries são calculadas no Operational; o frontend apenas visualiza as evidências disponíveis."
    >
      {(data) => {
        const operating = data.cag.chillers.filter((item) => item.state === 'OPERATING').length;
        const alarms = data.cag.chillers.filter((item) => item.alarmCode && item.alarmCode !== '0').length;
        const activePumps = data.cag.pumpGroups.reduce((sum, group) => sum + group.pumps.filter((pump) => pump.state === 'ON').length, 0);
        const chillersWithCoverage = data.cag.chillers.filter((item) => item.coveragePct != null);
        const avgCoverage = chillersWithCoverage.length ? chillersWithCoverage.reduce((sum, item) => sum + Number(item.coveragePct), 0) / chillersWithCoverage.length : null;
        const analytics = data.cag.analytics;

        const selectedWater = analytics?.water.find((item) => item.id === chillerGroup);
        const selectedCapacity = analytics?.capacity.find((item) => item.id === chillerGroup);
        const selectedPressure = analytics?.pressures.find((item) => item.id === chillerGroup);
        const selectedPump = analytics?.pumps.find((item) => item.id === pumpGroup);

        const trendWater = analytics?.water.find((item) => item.id === trendGroup);
        const trendCapacity = analytics?.capacity.find((item) => item.id === trendGroup);
        const trendPressure = analytics?.pressures.find((item) => item.id === trendGroup);
        const trendPump = analytics?.pumps.find((item) => item.id === trendGroup);

        return (
          <>
            <div className="dashboard-scrollbar overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 rounded-2xl border border-border bg-card p-2">
                {tabs.map((item) => (
                  <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn('rounded-xl px-4 py-2 text-xs font-semibold transition-colors', tab === item.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>{item.label}</button>
                ))}
              </div>
            </div>

            {tab === 'overview' ? (
              <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Chillers operando" value={`${operating}/3`} detail="Estado baseado em evidências do período." tone={operating ? 'ok' : 'info'} icon={Snowflake} />
                  <MetricCard label="Bombas ativas" value={String(activePumps)} detail="Somatório dos três grupos hidráulicos." tone={activePumps ? 'ok' : 'info'} icon={Waves} />
                  <MetricCard label="Alarmes observados" value={String(alarms)} detail="Código não é tratado automaticamente como causa raiz." tone={alarms ? 'warn' : 'ok'} icon={Activity} />
                  <MetricCard label="Cobertura dos chillers" value={avgCoverage == null ? 'N/D' : `${avgCoverage.toFixed(1).replace('.', ',')}%`} detail="Cobertura média das fontes do período." tone={(avgCoverage ?? 0) >= 90 ? 'ok' : 'warn'} icon={CircleGauge} />
                </section>

                <section className="grid min-w-0 gap-4 xl:grid-cols-2">
                  <Panel title="Horas de operação por chiller" icon={Activity}><ChillerOperationChart data={analytics?.chillerOperation || []} /></Panel>
                  <Panel title="Capacidade média por circuito" icon={Gauge}><ChillerCapacityComparisonChart data={analytics?.chillerCapacity || []} /></Panel>
                </section>

                <div className="grid gap-4 xl:grid-cols-3">{data.cag.chillers.map((item) => <ChillerCard key={item.id} chiller={item} />)}</div>
                <div className="grid gap-4 xl:grid-cols-3">{data.cag.pumpGroups.map((item) => <PumpGroupCard key={item.id} group={item} />)}</div>
              </>
            ) : null}

            {tab === 'chillers' ? (
              <>
                <div className="grid gap-4 xl:grid-cols-3">{data.cag.chillers.map((item) => <ChillerCard key={item.id} chiller={item} />)}</div>
                <Panel title={`Análise temporal · Chiller ${groups.find((g) => g.id === chillerGroup)?.label}`} icon={Snowflake} action={<Selector value={chillerGroup} onChange={setChillerGroup} />}>
                  <div className="grid min-w-0 gap-5">
                    <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Água gelada</p><ChillerWaterTrendChart data={selectedWater?.series || []} /></div>
                    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
                      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Capacidade</p><ChillerCapacityTrendChart data={selectedCapacity?.series || []} /></div>
                      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Pressões dos circuitos</p><ChillerPressureTrendChart data={selectedPressure?.series || []} /></div>
                    </div>
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === 'pumps' ? (
              <>
                <div className="grid gap-4 xl:grid-cols-3">{data.cag.pumpGroups.map((item) => <PumpGroupCard key={item.id} group={item} />)}</div>
                <Panel title={`Análise hidráulica · Grupo ${groups.find((g) => g.id === pumpGroup)?.label}`} icon={Waves} action={<Selector value={pumpGroup} onChange={setPumpGroup} />}>
                  <div className="grid min-w-0 gap-5 xl:grid-cols-2">
                    <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Pressão real × setpoint</p><PumpPressureTrendChart data={selectedPump?.pressureSeries || []} /></div>
                    <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Abertura do bypass</p><PumpBypassTrendChart data={selectedPump?.bypassSeries || []} /></div>
                    <div className="xl:col-span-2"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Estado das BAGs</p><PumpActivityChart data={selectedPump?.activitySeries || []} /></div>
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === 'trends' ? (
              <Panel
                title="Tendências analíticas"
                icon={Waves}
                action={<Selector value={trendGroup} onChange={setTrendGroup} />}
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  {([
                    ['water', 'Água gelada'],
                    ['capacity', 'Capacidade'],
                    ['pressures', 'Pressões'],
                    ['pumps', 'Bombas'],
                  ] as Array<[TrendContext, string]>).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setTrendContext(id)} className={cn('rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors', trendContext === id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground')}>{label}</button>
                  ))}
                </div>

                {trendContext === 'water' ? <ChillerWaterTrendChart data={trendWater?.series || []} /> : null}
                {trendContext === 'capacity' ? <ChillerCapacityTrendChart data={trendCapacity?.series || []} /> : null}
                {trendContext === 'pressures' ? <ChillerPressureTrendChart data={trendPressure?.series || []} /> : null}
                {trendContext === 'pumps' && trendPump ? (
                  <div className="grid min-w-0 gap-5 xl:grid-cols-2">
                    <PumpPressureTrendChart data={trendPump.pressureSeries} />
                    <PumpBypassTrendChart data={trendPump.bypassSeries} />
                    <div className="xl:col-span-2"><PumpActivityChart data={trendPump.activitySeries} /></div>
                  </div>
                ) : null}
              </Panel>
            ) : null}

            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
              <strong className="text-primary">Regra de governança:</strong> ΔT baixo isoladamente não caracteriza falha. No Expo Center Norte a carga térmica varia com ocupação, eventos e condições externas; qualquer diagnóstico deve correlacionar operação, setpoint, bypass, bombas, alarmes e qualidade das leituras.
            </section>
          </>
        );
      }}
    </ExpoShell>
  );
}
