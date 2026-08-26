import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, CheckCircle2, Database, RadioTower, ShieldCheck } from 'lucide-react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { CoverageBar, MetricCard, SourceStatusIcon } from '@/components/dashboard/ExpoWidgets';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export const Route = createFileRoute('/qualidade-dados')({ component: QualityPage });

function QualityPage() {
  return (
    <ExpoShell
      title="Qualidade dos Dados"
      description="Cobertura temporal, comunicação e validade das fontes. Dado ausente, falha de comunicação e zero medido são estados diferentes em toda a plataforma."
    >
      {(data) => {
        const ok = data.quality.sources.filter((source) => source.status === 'OK').length;
        const degraded = data.quality.sources.filter((source) => source.status === 'DEGRADED').length;
        const noData = data.quality.sources.filter((source) => source.status === 'NO_DATA' || source.status === 'COMM_ERROR').length;
        const sampleSources = data.quality.sources.filter((source) => source.expectedSamples != null && source.validSamples != null);
        const expected = sampleSources.length ? sampleSources.reduce((sum, source) => sum + Number(source.expectedSamples), 0) : null;
        const valid = sampleSources.length ? sampleSources.reduce((sum, source) => sum + Number(source.validSamples), 0) : null;

        return (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Cobertura geral" value={data.quality.overallCoveragePct == null ? 'N/D' : `${data.quality.overallCoveragePct.toFixed(1).replace('.', ',')}%`} detail="Cobertura consolidada das fontes conhecidas." tone={(data.quality.overallCoveragePct ?? 0) >= 90 ? 'ok' : 'warn'} icon={Database} />
              <MetricCard label="Fontes OK" value={String(ok)} detail={`${data.quality.sources.length} fontes monitoradas.`} tone="ok" icon={CheckCircle2} />
              <MetricCard label="Fontes degradadas" value={String(degraded)} detail="Recebidas, porém com cobertura ou qualidade limitada." tone={degraded ? 'warn' : 'ok'} icon={AlertTriangle} />
              <MetricCard label="Sem dados / comunicação" value={String(noData)} detail="Não entram em cálculos como zero." tone={noData ? 'crit' : 'ok'} icon={RadioTower} />
              <MetricCard label="Amostras válidas" value={valid == null || expected == null ? 'N/D' : `${valid}/${expected}`} detail="Somente fontes com contagens conhecidas entram neste total." tone={expected != null && expected > 0 && valid != null && valid / expected >= 0.9 ? 'ok' : 'warn'} icon={ShieldCheck} />
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {data.quality.sources.map((source) => (
                <article key={source.id} className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{source.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{source.lastSampleAt ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(source.lastSampleAt)) : 'Sem última amostra'}</p>
                    </div>
                    <SourceStatusIcon status={source.status} />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div><p className="text-2xl font-semibold">{source.coveragePct == null ? 'N/D' : `${source.coveragePct.toFixed(1).replace('.', ',')}%`}</p><p className="mt-1 text-xs text-muted-foreground">Cobertura</p></div>
                    <StatusBadge label={source.status === 'OK' ? 'OK' : source.status === 'DEGRADED' ? 'Degradada' : source.status === 'COMM_ERROR' ? 'Falha comunicação' : 'Sem dados'} tone={source.status === 'OK' ? 'ok' : source.status === 'DEGRADED' ? 'warn' : 'crit'} />
                  </div>
                  <CoverageBar value={source.coveragePct} />
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-surface p-3"><span className="text-muted-foreground">Válidas</span><p className="mt-1 font-semibold">{source.validSamples ?? 'N/D'}</p></div>
                    <div className="rounded-xl bg-surface p-3"><span className="text-muted-foreground">Esperadas</span><p className="mt-1 font-semibold">{source.expectedSamples ?? 'N/D'}</p></div>
                  </div>
                  {source.note ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{source.note}</p> : null}
                </article>
              ))}
            </div>

            <Panel title="Regras de qualidade aplicadas" icon={ShieldCheck}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Ausência ≠ zero', 'Textos como “No samples in range” permanecem ausentes e reduzem a cobertura.'],
                  ['Comunicação separada', 'Falha de dispositivo ou de integração é apresentada como falha de comunicação.'],
                  ['Reset de hidrômetro', 'Delta negativo não é somado ao consumo e reinicia a referência para a próxima leitura válida.'],
                  ['Diagnóstico condicionado', 'Variáveis com cobertura ou escala suspeita ficam bloqueadas para conclusões técnicas.'],
                ].map(([title, text]) => <div key={title} className="rounded-xl bg-surface p-4"><p className="text-sm font-semibold">{title}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p></div>)}
              </div>
            </Panel>
          </>
        );
      }}
    </ExpoShell>
  );
}
