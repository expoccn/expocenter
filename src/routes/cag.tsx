import { createFileRoute } from '@tanstack/react-router';
import { Activity, CircleGauge, Gauge, Snowflake, Waves } from 'lucide-react';
import { useState } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { ChillerSummaryCard, MetricCard, PumpGroupCard } from '@/components/dashboard/ExpoWidgets';
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
    <div className="expo-segmented">
      {groups.map((group) => <button key={group.id} type="button" onClick={() => onChange(group.id)} data-active={value === group.id} className="expo-segmented-button">{group.label}</button>)}
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
    <ExpoShell title="CAG" description="Monitoramento dos chillers e grupos hidráulicos da Central de Água Gelada.">
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
            <div className="dashboard-scrollbar overflow-x-auto pb-0.5">
              <div className="expo-segmented">
                {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} data-active={tab === item.id} className="expo-segmented-button">{item.label}</button>)}
              </div>
            </div>

            {tab === 'overview' ? (
              <>
                <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Chillers operando" value={`${operating}/3`} detail="Evidência de operação no período." tone={operating ? 'ok' : 'info'} icon={Snowflake} />
                  <MetricCard label="Bombas ativas" value={String(activePumps)} detail="Somatório dos três grupos hidráulicos." tone={activePumps ? 'ok' : 'info'} icon={Waves} />
                  <MetricCard label="Alarmes observados" value={String(alarms)} detail="Sem inferência automática de causa raiz." tone={alarms ? 'warn' : 'ok'} icon={Activity} />
                  <MetricCard label="Cobertura dos chillers" value={avgCoverage == null ? 'N/D' : `${avgCoverage.toFixed(1).replace('.', ',')}%`} detail="Cobertura média das três fontes." tone={(avgCoverage ?? 0) >= 90 ? 'ok' : 'warn'} icon={CircleGauge} />
                </section>
                <section className="grid min-w-0 gap-3.5 xl:grid-cols-2">
                  <Panel title="Horas de operação por chiller" icon={Activity}><ChillerOperationChart data={analytics?.chillerOperation || []} /></Panel>
                  <Panel title="Capacidade média por circuito" icon={Gauge}><ChillerCapacityComparisonChart data={analytics?.chillerCapacity || []} /></Panel>
                </section>
                <div className="grid gap-3 xl:grid-cols-3">{data.cag.chillers.map((item) => <ChillerSummaryCard key={item.id} chiller={item} />)}</div>
                <div className="grid gap-3 xl:grid-cols-3">{data.cag.pumpGroups.map((item) => <PumpGroupCard key={item.id} group={item} />)}</div>
              </>
            ) : null}

            {tab === 'chillers' ? (
              <>
                <div className="grid gap-3 xl:grid-cols-3">
                  {data.cag.chillers.map((item) => <ChillerSummaryCard key={item.id} chiller={item} selected={item.id === chillerGroup} onClick={() => setChillerGroup(item.id)} />)}
                </div>
                <section className="grid min-w-0 gap-3.5 xl:grid-cols-2">
                  <Panel title={`Água gelada · Chiller ${groups.find((g) => g.id === chillerGroup)?.label}`} icon={Snowflake} action={<Selector value={chillerGroup} onChange={setChillerGroup} />}><ChillerWaterTrendChart data={selectedWater?.series || []} /></Panel>
                  <Panel title="Capacidade (%)" icon={Gauge}><ChillerCapacityTrendChart data={selectedCapacity?.series || []} /></Panel>
                  <Panel title="Pressões dos circuitos" icon={CircleGauge} className="xl:col-span-2"><ChillerPressureTrendChart data={selectedPressure?.series || []} /></Panel>
                </section>
              </>
            ) : null}

            {tab === 'pumps' ? (
              <>
                <div className="flex justify-end"><Selector value={pumpGroup} onChange={setPumpGroup} /></div>
                <div className="grid gap-3 xl:grid-cols-3">{data.cag.pumpGroups.map((item) => <PumpGroupCard key={item.id} group={item} />)}</div>
                <section className="grid min-w-0 gap-3.5 xl:grid-cols-2">
                  <Panel title={`Pressão da linha × setpoint · Grupo ${groups.find((g) => g.id === pumpGroup)?.label}`} icon={Gauge}><PumpPressureTrendChart data={selectedPump?.pressureSeries || []} /></Panel>
                  <Panel title="Abertura do bypass" icon={Waves}><PumpBypassTrendChart data={selectedPump?.bypassSeries || []} /></Panel>
                  <Panel title="Estado das BAGs" icon={Activity} className="xl:col-span-2"><PumpActivityChart data={selectedPump?.activitySeries || []} /></Panel>
                </section>
              </>
            ) : null}

            {tab === 'trends' ? (
              <Panel title="Tendências analíticas" icon={Waves} action={<Selector value={trendGroup} onChange={setTrendGroup} />}>
                <div className="mb-3 dashboard-scrollbar overflow-x-auto pb-0.5">
                  <div className="expo-segmented">
                    {([['water', 'Água gelada'], ['capacity', 'Capacidade'], ['pressures', 'Pressões'], ['pumps', 'Bombas']] as Array<[TrendContext, string]>).map(([id, label]) => (
                      <button key={id} type="button" onClick={() => setTrendContext(id)} data-active={trendContext === id} className="expo-segmented-button">{label}</button>
                    ))}
                  </div>
                </div>
                {trendContext === 'water' ? <ChillerWaterTrendChart data={trendWater?.series || []} /> : null}
                {trendContext === 'capacity' ? <ChillerCapacityTrendChart data={trendCapacity?.series || []} /> : null}
                {trendContext === 'pressures' ? <ChillerPressureTrendChart data={trendPressure?.series || []} /> : null}
                {trendContext === 'pumps' && trendPump ? <div className="grid min-w-0 gap-3.5 xl:grid-cols-2"><PumpPressureTrendChart data={trendPump.pressureSeries} /><PumpBypassTrendChart data={trendPump.bypassSeries} /><div className="xl:col-span-2"><PumpActivityChart data={trendPump.activitySeries} /></div></div> : null}
              </Panel>
            ) : null}

            <section className="rounded-xl border border-primary/15 bg-primary/[0.035] px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-primary">Governança:</strong> ΔT baixo isoladamente não caracteriza falha. Diagnósticos devem correlacionar carga, operação, setpoint, bypass, bombas, alarmes e qualidade das leituras.
            </section>
          </>
        );
      }}
    </ExpoShell>
  );
}
