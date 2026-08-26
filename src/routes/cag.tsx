import { createFileRoute } from '@tanstack/react-router';
import { Activity, CircleGauge, Snowflake, Waves } from 'lucide-react';
import { useState } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { CagTrendChart, ChillerCard, MetricCard, PumpGroupCard } from '@/components/dashboard/ExpoWidgets';
import { Panel } from '@/components/dashboard/Panel';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/cag')({ component: CagPage });

type CagTab = 'overview' | 'chillers' | 'pumps' | 'trends';

const tabs: Array<{ id: CagTab; label: string }> = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'chillers', label: 'Chillers' },
  { id: 'pumps', label: 'Bombas & Hidráulica' },
  { id: 'trends', label: 'Tendências' },
];

function CagPage() {
  const [tab, setTab] = useState<CagTab>('overview');

  return (
    <ExpoShell
      title="Central de Água Gelada"
      description="Análise dos chillers Azul, Branco e Vermelho e dos respectivos grupos de bombas. Valores sem cobertura suficiente permanecem explicitamente indisponíveis."
    >
      {(data) => {
        const operating = data.cag.chillers.filter((item) => item.state === 'OPERATING').length;
        const alarms = data.cag.chillers.filter((item) => item.alarmCode && item.alarmCode !== '0').length;
        const activePumps = data.cag.pumpGroups.reduce((sum, group) => sum + group.pumps.filter((pump) => pump.state === 'ON').length, 0);
        const chillersWithCoverage = data.cag.chillers.filter((item) => item.coveragePct != null);
        const avgCoverage = chillersWithCoverage.length ? chillersWithCoverage.reduce((sum, item) => sum + Number(item.coveragePct), 0) / chillersWithCoverage.length : null;
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
                <div className="grid gap-4 xl:grid-cols-3">{data.cag.chillers.map((item) => <ChillerCard key={item.id} chiller={item} />)}</div>
                <div className="grid gap-4 xl:grid-cols-3">{data.cag.pumpGroups.map((item) => <PumpGroupCard key={item.id} group={item} />)}</div>
              </>
            ) : null}

            {tab === 'chillers' ? <div className="grid gap-4 xl:grid-cols-3">{data.cag.chillers.map((item) => <ChillerCard key={item.id} chiller={item} />)}</div> : null}
            {tab === 'pumps' ? <div className="grid gap-4 xl:grid-cols-3">{data.cag.pumpGroups.map((item) => <PumpGroupCard key={item.id} group={item} />)}</div> : null}
            {tab === 'trends' ? (
              <Panel title="Temperaturas e ΔT por chiller" icon={Waves}><CagTrendChart data={data.cag.trends} /></Panel>
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
