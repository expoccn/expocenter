import { createFileRoute } from '@tanstack/react-router';
import { Download, Droplets, FileBarChart, FileText, LoaderCircle, Presentation, ShieldCheck } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { Panel } from '@/components/dashboard/Panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EXPO_PPTX_ENABLED, EXPO_PREVIEW_MODE } from '@/lib/expoConfig';
import { downloadCagReport, downloadWaterDemonstrative, downloadWaterMonthlyReport } from '@/services/expo';
import type { WaterDemonstrativeRequest } from '@/types/expo';

export const Route = createFileRoute('/relatorios')({ component: ReportsPage });

type BusyKey = string | null;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const cagReports = [
  { type: 'daily' as const, label: 'Diário', description: 'Operação do último dia válido, ocorrências, qualidade e recomendações.' },
  { type: 'weekly' as const, label: 'Semanal', description: 'Tendências, recorrências e comparação com o período anterior.' },
  { type: 'monthly' as const, label: 'Mensal', description: 'Visão executiva consolidada da CAG para gestão e apresentação.' },
];

function ReportsPage() {
  const [busy, setBusy] = useState<BusyKey>(null);
  const [message, setMessage] = useState('');
  const [waterForm, setWaterForm] = useState<WaterDemonstrativeRequest>({
    localId: 'pavilhao_azul',
    startDate: todayIso(),
    startTime: '00:00',
    endDate: todayIso(),
    endTime: '23:00',
    reportType: 'cliente',
    tariffM3: 31.84,
  });

  const meterOptions = useMemo(() => [
    ['pavilhao_vermelho_a', 'Pavilhão Vermelho A'],
    ['pavilhao_verde_a', 'Pavilhão Verde A'],
    ['pavilhao_vermelho_a_reuso', 'Pavilhão Vermelho A — Reúso'],
    ['pavilhao_verde_a_reuso', 'Pavilhão Verde A — Reúso'],
    ['pavilhao_vermelho_b', 'Pavilhão Vermelho B'],
    ['pavilhao_verde_b', 'Pavilhão Verde B'],
    ['pavilhao_branco_b', 'Pavilhão Branco B'],
    ['pavilhao_vermelho_b_reuso', 'Pavilhão Vermelho B — Reúso'],
    ['pavilhao_verde_b_reuso', 'Pavilhão Verde B — Reúso'],
    ['pavilhao_branco_b_reuso', 'Pavilhão Branco B — Reúso'],
    ['pavilhao_amarelo_otto', 'Pavilhão Amarelo Otto'],
    ['caminhao_pipa', 'Caminhão Pipa'],
    ['pavilhao_azul_reuso', 'Pavilhão Azul — Reúso'],
    ['pavilhao_branco_reuso', 'Pavilhão Branco — Reúso'],
    ['centro_de_convencoes_reuso', 'Centro de Convenções — Reúso'],
    ['pavilhao_azul', 'Pavilhão Azul'],
    ['centro_de_convencoes', 'Centro de Convenções'],
  ] as const, []);

  const run = async (key: string, action: () => Promise<void>) => {
    setMessage('');
    setBusy(key);
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir a geração.');
    } finally {
      setBusy(null);
    }
  };

  const handleWater = async (event: FormEvent) => {
    event.preventDefault();
    await run('water-demo', () => downloadWaterDemonstrative(waterForm));
  };

  return (
    <ExpoShell title="Relatórios" description="Relatórios da CAG e gestão hídrica reunidos no mesmo módulo. O frontend baixa artefatos publicados pelos workflows; nenhum KPI é recalculado no navegador.">
      {() => (
        <>
          {EXPO_PREVIEW_MODE ? (
            <div className="rounded-[14px] border border-warning/25 bg-warning/8 px-4 py-3 text-sm text-warning">
              <strong>Modo de homologação visual:</strong> os botões e contratos estão preparados, mas a geração fica bloqueada até os workflows Expo V2 serem implantados.
            </div>
          ) : null}
          {!EXPO_PPTX_ENABLED && !EXPO_PREVIEW_MODE ? (
            <div className="rounded-[14px] border border-border bg-surface/50 px-4 py-3 text-sm text-muted-foreground">
              PowerPoint permanece desabilitado até o serviço <code>expo-pptx-service</code> e os workflows 39–41 serem ativados. Os PDFs continuam disponíveis pela última versão publicada.
            </div>
          ) : null}
          {message ? <div className="rounded-[14px] border border-critical/25 bg-critical/8 px-4 py-3 text-sm text-critical">{message}</div> : null}

          <Panel title="Relatórios da CAG" icon={FileBarChart}>
            <div className="grid gap-4 lg:grid-cols-3">
              {cagReports.map((report) => (
                <article key={report.type} className="rounded-[14px] border border-border bg-surface/40 p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">Relatório {report.label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{report.description}</p></div><StatusBadge label="CAG" tone="info" /></div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button variant="outline" disabled={busy !== null || EXPO_PREVIEW_MODE} onClick={() => void run(`cag-${report.type}-pdf`, () => downloadCagReport(report.type, 'pdf'))}>
                      {busy === `cag-${report.type}-pdf` ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} Baixar PDF
                    </Button>
                    <Button variant="outline" disabled={busy !== null || EXPO_PREVIEW_MODE || !EXPO_PPTX_ENABLED} onClick={() => void run(`cag-${report.type}-pptx`, () => downloadCagReport(report.type, 'pptx'))}>
                      {busy === `cag-${report.type}-pptx` ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Presentation className="mr-2 h-4 w-4" />} PowerPoint
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Relatório consolidado de hidrômetros" icon={Droplets}>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div>
                <p className="text-sm font-semibold">Relatório Mensal de Gestão Hídrica</p>
                <p className="mt-2 max-w-4xl text-xs leading-relaxed text-muted-foreground">
                  Evolução da antiga V3.3: consumo bruto e ajustado, potável × reúso, janela 10h–18h, noturno, ranking, pavimentos, heatmaps, resets, falhas de comunicação, qualidade e anomalias.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={busy !== null || EXPO_PREVIEW_MODE} onClick={() => void run('water-monthly-pdf', () => downloadWaterMonthlyReport('pdf'))}>
                  <Download className="mr-2 h-4 w-4" /> Baixar PDF
                </Button>
                <Button variant="outline" disabled={busy !== null || EXPO_PREVIEW_MODE || !EXPO_PPTX_ENABLED} onClick={() => void run('water-monthly-pptx', () => downloadWaterMonthlyReport('pptx'))}>
                  <Presentation className="mr-2 h-4 w-4" /> PowerPoint
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Demonstrativo de Água — Cliente / Técnico" icon={ShieldCheck}>
            <form onSubmit={handleWater} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              <div className="space-y-2 xl:col-span-2"><Label htmlFor="water-local">Local / hidrômetro</Label><select id="water-local" value={waterForm.localId} onChange={(event) => setWaterForm((prev) => ({ ...prev, localId: event.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">{meterOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="water-start-date">Data inicial</Label><Input id="water-start-date" type="date" value={waterForm.startDate} onChange={(event) => setWaterForm((prev) => ({ ...prev, startDate: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="water-start-time">Hora inicial</Label><Input id="water-start-time" type="time" value={waterForm.startTime} onChange={(event) => setWaterForm((prev) => ({ ...prev, startTime: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="water-end-date">Data final</Label><Input id="water-end-date" type="date" value={waterForm.endDate} onChange={(event) => setWaterForm((prev) => ({ ...prev, endDate: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="water-end-time">Hora final</Label><Input id="water-end-time" type="time" value={waterForm.endTime} onChange={(event) => setWaterForm((prev) => ({ ...prev, endTime: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="water-type">Tipo</Label><select id="water-type" value={waterForm.reportType} onChange={(event) => setWaterForm((prev) => ({ ...prev, reportType: event.target.value as 'cliente' | 'tecnico' }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"><option value="cliente">Cliente</option><option value="tecnico">Técnico</option></select></div>
              <div className="space-y-2"><Label htmlFor="water-tariff">Tarifa (R$/m³)</Label><Input id="water-tariff" type="number" min="0" step="0.01" value={waterForm.tariffM3} onChange={(event) => setWaterForm((prev) => ({ ...prev, tariffM3: Number(event.target.value) }))} /></div>
              <div className="flex items-end md:col-span-2 xl:col-span-4 2xl:col-span-7"><Button className="w-full sm:w-auto" type="submit" disabled={busy !== null || EXPO_PREVIEW_MODE}>{busy === 'water-demo' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Gerar demonstrativo</Button></div>
            </form>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-surface p-4"><p className="text-sm font-semibold">Cliente</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Leitura inicial/final, consumo, tarifa informada, valor e resumo diário. Documento de conferência.</p></div>
              <div className="rounded-xl bg-surface p-4"><p className="text-sm font-semibold">Técnico</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Cobertura, confiabilidade, estatísticas, leituras hora a hora, anomalias e indicação de medidor parado/consumo zero.</p></div>
            </div>
          </Panel>
        </>
      )}
    </ExpoShell>
  );
}
