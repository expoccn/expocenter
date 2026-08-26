import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, CheckCircle2, Database, RadioTower, ShieldCheck } from 'lucide-react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { MetricCard, SourceStatusIcon } from '@/components/dashboard/ExpoWidgets';
import { QualityAvailabilityHistoryChart, QualityCoverageChart, QualityStatusDonut } from '@/components/dashboard/AnalyticsCharts';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export const Route = createFileRoute('/qualidade-dados')({ component: QualityPage });

function QualityPage() {
  return (
    <ExpoShell title="Qualidade dos Dados" description="Confiabilidade, cobertura, comunicação e disponibilidade das fontes monitoradas.">
      {(data) => {
        const ok = data.quality.sources.filter((source) => source.status === 'OK').length;
        const degraded = data.quality.sources.filter((source) => source.status === 'DEGRADED').length;
        const noData = data.quality.sources.filter((source) => source.status === 'NO_DATA' || source.status === 'COMM_ERROR').length;
        const sampleSources = data.quality.sources.filter((source) => source.expectedSamples != null && source.validSamples != null);
        const expected = sampleSources.length ? sampleSources.reduce((sum, source) => sum + Number(source.expectedSamples), 0) : null;
        const valid = sampleSources.length ? sampleSources.reduce((sum, source) => sum + Number(source.validSamples), 0) : null;
        const analytics = data.quality.analytics;

        return (
          <>
            <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Cobertura geral" value={data.quality.overallCoveragePct == null ? 'N/D' : `${data.quality.overallCoveragePct.toFixed(1).replace('.', ',')}%`} detail="Cobertura consolidada das fontes conhecidas." tone={(data.quality.overallCoveragePct ?? 0) >= 90 ? 'ok' : 'warn'} icon={Database} />
              <MetricCard label="Fontes OK" value={`${ok}/${data.quality.sources.length}`} detail="Fontes recebidas com qualidade adequada." tone="ok" icon={CheckCircle2} />
              <MetricCard label="Fontes degradadas" value={String(degraded)} detail="Cobertura ou qualidade parcial no período." tone={degraded ? 'warn' : 'ok'} icon={AlertTriangle} />
              <MetricCard label="Sem dados / comunicação" value={String(noData)} detail={valid == null || expected == null ? 'Ausência nunca é convertida em zero.' : `${valid}/${expected} amostras válidas nas fontes com contagem conhecida.`} tone={noData ? 'crit' : 'ok'} icon={RadioTower} />
            </section>

            <section className="grid min-w-0 gap-3.5 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.62fr)_minmax(0,1fr)]">
              <Panel title="Cobertura por fonte" icon={Database}><QualityCoverageChart data={data.quality.sources.map((source) => ({ label: source.label, coveragePct: source.coveragePct }))} /></Panel>
              <Panel title="Composição dos status" icon={ShieldCheck}><QualityStatusDonut data={analytics?.statusBreakdown || []} /></Panel>
              <Panel title="Disponibilidade diária das 6 fontes CAG" icon={RadioTower}><QualityAvailabilityHistoryChart data={analytics?.cagAvailabilityHistory || []} /></Panel>
            </section>

            <Panel title="Detalhamento das fontes" icon={Database}>
              <div className="dashboard-scrollbar overflow-x-auto">
                <table className="w-full min-w-[940px] text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-surface/55 text-left text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2.5">Fonte</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Cobertura</th><th className="px-3 py-2.5">Válidas</th><th className="px-3 py-2.5">Esperadas</th><th className="px-3 py-2.5">Última amostra</th><th className="px-3 py-2.5">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quality.sources.map((source) => (
                      <tr key={source.id} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-3 font-semibold text-foreground">{source.label}</td>
                        <td className="px-3 py-3"><div className="flex items-center gap-2"><SourceStatusIcon status={source.status} /><StatusBadge label={source.status === 'OK' ? 'OK' : source.status === 'DEGRADED' ? 'Degradada' : source.status === 'COMM_ERROR' ? 'Falha comunicação' : 'Sem dados'} tone={source.status === 'OK' ? 'ok' : source.status === 'DEGRADED' ? 'warn' : 'crit'} /></div></td>
                        <td className="px-3 py-3 font-medium">{source.coveragePct == null ? 'N/D' : `${source.coveragePct.toFixed(1).replace('.', ',')}%`}</td>
                        <td className="px-3 py-3 text-muted-foreground">{source.validSamples ?? 'N/D'}</td>
                        <td className="px-3 py-3 text-muted-foreground">{source.expectedSamples ?? 'N/D'}</td>
                        <td className="px-3 py-3 text-muted-foreground">{source.lastSampleAt ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(source.lastSampleAt)) : 'Sem última amostra'}</td>
                        <td className="max-w-[360px] px-3 py-3 text-muted-foreground">{source.note || 'Sem observação.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Regras de qualidade aplicadas" icon={ShieldCheck}>
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Ausência ≠ zero', '“No samples in range” permanece ausente e reduz a cobertura.'],
                  ['Comunicação separada', 'Falha de dispositivo ou integração é apresentada como falha de comunicação.'],
                  ['Reset de hidrômetro', 'Delta negativo não é somado e reinicia a referência para a próxima leitura válida.'],
                  ['Diagnóstico condicionado', 'Cobertura ou escala suspeita bloqueia conclusões técnicas automáticas.'],
                ].map(([title, text]) => <div key={title} className="rounded-xl bg-surface/65 p-3.5"><p className="text-[11px] font-semibold text-foreground">{title}</p><p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{text}</p></div>)}
              </div>
            </Panel>
          </>
        );
      }}
    </ExpoShell>
  );
}
