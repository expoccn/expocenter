import { createFileRoute } from '@tanstack/react-router';
import { Bot, Database, Eraser, LoaderCircle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { Panel } from '@/components/dashboard/Panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { usePeriod } from '@/context/PeriodContext';
import { askExpoAi, clearExpoAiHistory, fetchExpoAiHistory, type ExpoAiEvidence, type ExpoAiHistoryEntry } from '@/services/expo';
import { getOrCreateAiSessionId } from '@/lib/aiSession';

export const Route = createFileRoute('/analises-ia')({ component: AiPage });

type ChatEntry = {
  id: string;
  timestamp: string | null;
  question: string;
  answer: string;
  evidence: ExpoAiEvidence[];
  limitations: string[];
  usedLlm: boolean;
  status: 'complete' | 'error';
};

type PendingChat = {
  id: string;
  timestamp: string;
  question: string;
};


type EvidenceRecord = Record<string, unknown>;

const fieldLabels: Record<string, string> = {
  id: 'Equipamento',
  date: 'Data',
  data: 'Data',
  entrada: 'Entrada',
  saida: 'Saída',
  horas: 'Horas de operação',
  alarmes: 'Alarmes',
  total_m3: 'Consumo total',
  potavel_m3: 'Água potável',
  reuso_m3: 'Água de reúso',
  reuso_pct: 'Participação do reúso',
  chillers_online: 'Chillers online',
  capacidade_media: 'Capacidade média',
  delta_t_medio: 'ΔT médio',
  bypass_medio: 'Bypass médio',
  cobertura_pct: 'Cobertura',
  coverage_pct: 'Cobertura',
  leituras: 'Leituras',
  readings: 'Leituras',
  valid_readings: 'Leituras válidas',
  valid_deltas: 'Deltas válidos',
  anomalies: 'Anomalias',
  anomalias: 'Anomalias',
};

const sourceLabels: Record<string, string> = {
  raw_latest: 'Leitura mais recente',
  water_period: 'Resumo hídrico do período',
  cag_period: 'Resumo operacional do CAG',
  period_summary: 'Resumo consolidado do período',
  aligned_daily: 'Série diária alinhada',
  daily_alignment: 'Série diária alinhada',
  quality: 'Qualidade dos dados',
  preview: 'Dados de homologação',
};

function isRecord(value: unknown): value is EvidenceRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function humanizeKey(key: string) {
  if (fieldLabels[key]) return fieldLabels[key];
  return key
    .replace(/_m3$/i, '')
    .replace(/_pct$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase('pt-BR'));
}

function humanizeSource(source?: string) {
  if (!source) return null;
  if (sourceLabels[source]) return sourceLabels[source];
  return source
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase('pt-BR'));
}

function formatDateValue(value: unknown) {
  const text = String(value ?? '');
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : text || 'N/D';
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(1, maximumFractionDigits),
    maximumFractionDigits,
  });
}

function unitForKey(key: string) {
  if (/_m3$/i.test(key)) return 'm³';
  if (/_pct$/i.test(key) || /coverage|cobertura/i.test(key)) return '%';
  if (/delta_t/i.test(key)) return '°C';
  if (/horas?/i.test(key)) return 'h';
  return '';
}

function formatScalar(value: unknown, key = '', explicitUnit = '') {
  if (value === null || value === undefined || value === '') return 'N/D';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') {
    const unit = explicitUnit || unitForKey(key);
    return `${formatNumber(value, 2)}${unit ? ` ${unit}` : ''}`;
  }
  if ((key === 'date' || key === 'data') && typeof value === 'string') return formatDateValue(value);
  return String(value);
}

function evidenceIsWide(value: unknown) {
  if (Array.isArray(value)) return true;
  if (!isRecord(value)) return false;
  return Object.values(value).some((item) => Array.isArray(item) || isRecord(item)) || Object.keys(value).length > 5;
}

function TemperatureEvidence({ value }: { value: EvidenceRecord }) {
  const unit = typeof value.unidade === 'string' ? value.unidade : '°C';
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="rounded-xl bg-surface px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Entrada</p>
        <p className="mt-1 text-base font-semibold tabular-nums">{formatScalar(value.entrada, 'entrada', unit)}</p>
      </div>
      <div className="rounded-xl bg-surface px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Saída</p>
        <p className="mt-1 text-base font-semibold tabular-nums">{formatScalar(value.saida, 'saida', unit)}</p>
      </div>
    </div>
  );
}

function WaterSummaryEvidence({ value }: { value: EvidenceRecord }) {
  const items = [
    ['total_m3', value.total_m3],
    ['potavel_m3', value.potavel_m3],
    ['reuso_m3', value.reuso_m3],
    ['reuso_pct', value.reuso_pct],
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {items.map(([key, item]) => (
        <div key={key} className="rounded-xl bg-surface px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{humanizeKey(key)}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums">{formatScalar(item, key)}</p>
        </div>
      ))}
    </div>
  );
}

function ChillerSummaryEvidence({ rows }: { rows: EvidenceRecord[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, index) => {
        const equipmentRaw = String(row.id ?? row.nome ?? row.chiller ?? `${index + 1}`);
        const equipment = equipmentRaw
          .replace(/^chiller[_\s-]*/i, '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toLocaleUpperCase('pt-BR'));
        const alarms = Array.isArray(row.alarmes) ? row.alarmes : [];
        return (
          <div key={`${equipmentRaw}-${index}`} className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-xs font-semibold">Chiller {equipment}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span><strong className="font-semibold text-foreground">{formatScalar(row.horas, 'horas')}</strong> de operação</span>
              <span>{alarms.length ? `${alarms.length} alarme${alarms.length > 1 ? 's' : ''}: ${alarms.join(', ')}` : 'Sem alarmes'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AlignedDayRow({ row }: { row: EvidenceRecord }) {
  const cag = isRecord(row.cag) ? row.cag : {};
  const water = isRecord(row.water) ? row.water : {};
  return (
    <div className="grid gap-2 border-b border-border/60 py-2.5 last:border-b-0 md:grid-cols-[92px_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="text-xs font-semibold tabular-nums">{formatDateValue(row.date ?? row.data)}</div>
      <div className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">CAG</span>
        <span className="ml-2">Online: {formatScalar(cag.chillers_online)}</span>
        <span className="ml-2">· ΔT: {formatScalar(cag.delta_t_medio, 'delta_t_medio')}</span>
        <span className="ml-2">· Bypass: {formatScalar(cag.bypass_medio, 'bypass_medio')}</span>
      </div>
      <div className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Água</span>
        <span className="ml-2">Total: {formatScalar(water.total_m3, 'total_m3')}</span>
        <span className="ml-2">· Potável: {formatScalar(water.potavel_m3, 'potavel_m3')}</span>
        <span className="ml-2">· Reúso: {formatScalar(water.reuso_m3, 'reuso_m3')}</span>
      </div>
    </div>
  );
}

function AlignedDailyEvidence({ rows }: { rows: EvidenceRecord[] }) {
  const previewRows = rows.slice(0, 4);
  const remainingRows = rows.slice(4);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground"><strong className="text-foreground">{rows.length}</strong> dias com dados relacionados</p>
        <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">Resumo diário</span>
      </div>
      <div className="mt-2 rounded-xl bg-surface/65 px-3">
        {previewRows.map((row, index) => <AlignedDayRow key={`${String(row.date ?? row.data)}-${index}`} row={row} />)}
        {remainingRows.length ? (
          <details className="group border-t border-border/60">
            <summary className="cursor-pointer list-none py-2.5 text-xs font-semibold text-primary marker:content-none">
              <span className="group-open:hidden">Ver mais {remainingRows.length} dias</span>
              <span className="hidden group-open:inline">Ocultar detalhes adicionais</span>
            </summary>
            <div>
              {remainingRows.map((row, index) => <AlignedDayRow key={`${String(row.date ?? row.data)}-more-${index}`} row={row} />)}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}

function GenericRecordEvidence({ value }: { value: EvidenceRecord }) {
  const visibleEntries = Object.entries(value).filter(([key]) => !['metrica', 'metric', 'source'].includes(key));
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {visibleEntries.map(([key, item]) => (
        <div key={key} className="rounded-xl bg-surface px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{humanizeKey(key)}</p>
          {Array.isArray(item) ? (
            <p className="mt-1 text-xs leading-relaxed">{item.length ? item.map((entry) => formatScalar(entry)).join(', ') : 'Nenhum'}</p>
          ) : isRecord(item) ? (
            <div className="mt-1 space-y-1 text-xs leading-relaxed">
              {Object.entries(item).map(([nestedKey, nestedValue]) => (
                <p key={nestedKey}><span className="text-muted-foreground">{humanizeKey(nestedKey)}:</span> <span className="font-medium">{formatScalar(nestedValue, nestedKey)}</span></p>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold tabular-nums">{formatScalar(item, key)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function GenericArrayEvidence({ values }: { values: unknown[] }) {
  const preview = values.slice(0, 6);
  const remaining = values.slice(6);
  const renderItem = (item: unknown, index: number) => (
    <div key={index} className="rounded-xl bg-surface px-3 py-2.5 text-xs leading-relaxed">
      {isRecord(item) ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(item).map(([key, value]) => (
            <span key={key}><span className="text-muted-foreground">{humanizeKey(key)}:</span> <strong className="font-semibold">{Array.isArray(value) ? (value.length ? value.join(', ') : 'Nenhum') : formatScalar(value, key)}</strong></span>
          ))}
        </div>
      ) : formatScalar(item)}
    </div>
  );
  return (
    <div className="space-y-2">
      {preview.map(renderItem)}
      {remaining.length ? (
        <details className="rounded-xl border border-border/70 px-3">
          <summary className="cursor-pointer py-2.5 text-xs font-semibold text-primary">Ver mais {remaining.length} registros</summary>
          <div className="space-y-2 pb-3">{remaining.map((item, index) => renderItem(item, index + preview.length))}</div>
        </details>
      ) : null}
    </div>
  );
}

function EvidenceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <p className="text-sm font-semibold text-muted-foreground">N/D</p>;
  }
  if (Array.isArray(value)) {
    const records = value.filter(isRecord);
    if (records.length === value.length && records.length > 0) {
      if (records.every((row) => 'id' in row && 'horas' in row && 'alarmes' in row)) return <ChillerSummaryEvidence rows={records} />;
      if (records.every((row) => ('date' in row || 'data' in row) && ('cag' in row || 'water' in row))) return <AlignedDailyEvidence rows={records} />;
    }
    return <GenericArrayEvidence values={value} />;
  }
  if (isRecord(value)) {
    if ('entrada' in value || 'saida' in value) return <TemperatureEvidence value={value} />;
    if ('total_m3' in value && ('potavel_m3' in value || 'reuso_m3' in value)) return <WaterSummaryEvidence value={value} />;
    return <GenericRecordEvidence value={value} />;
  }
  return <p className="text-sm font-semibold tabular-nums">{formatScalar(value)}</p>;
}

function EvidenceCard({ evidence }: { evidence: ExpoAiEvidence }) {
  const source = humanizeSource(evidence.source);
  return (
    <div className={`rounded-2xl border border-border bg-card/65 p-3.5 ${evidenceIsWide(evidence.value) ? 'sm:col-span-2' : ''}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{evidence.label}</p>
        {source ? (
          <span title={evidence.source} className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            {source}
          </span>
        ) : null}
      </div>
      <EvidenceValue value={evidence.value} />
    </div>
  );
}

function normalizeHistoryEntry(entry: ExpoAiHistoryEntry, index: number): ChatEntry {
  const timestamp = entry.ts || entry.timestamp || null;
  return {
    id: entry.id || `${timestamp || 'history'}-${index}`,
    timestamp,
    question: entry.question || 'Consulta anterior',
    answer: entry.answer || 'Consulta concluída sem texto de resposta.',
    evidence: Array.isArray(entry.evidence) ? entry.evidence : [],
    limitations: Array.isArray(entry.limitations) ? entry.limitations : [],
    usedLlm: entry.used_llm === true,
    status: 'complete',
  };
}

function clientMessageId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const suggestions = [
  'Qual o Chiller que está em funcionamento?',
  'Tem algum chiller com alarme? Se sim, qual é o alarme e a descrição?',
  'Quantas horas meu chiller está operando?',
  'Qual é a temperatura de entrada e saída da água de cada chiller?',
  'Tenho alguma bomba em alarme?',
  'Tenho alguma bomba em manual?',
];

function AiPage() {
  const { period } = usePeriod();
  const sessionId = useMemo(getOrCreateAiSessionId, []);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [pending, setPending] = useState<PendingChat | null>(null);
  const [busy, setBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    fetchExpoAiHistory(sessionId)
      .then((response) => {
        if (active) setHistory((response.history || []).map(normalizeHistoryEntry));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar o histórico da IA.');
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => { active = false; };
  }, [sessionId]);

  useEffect(() => {
    if (historyLoading) return;
    const frame = globalThis.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => globalThis.cancelAnimationFrame(frame);
  }, [history.length, historyLoading, pending]);

  const submit = async (event?: FormEvent, explicit?: string) => {
    event?.preventDefault();
    const value = (explicit ?? question).trim();
    if (!value || busy) return;

    const pendingMessage: PendingChat = {
      id: clientMessageId('pending'),
      timestamp: new Date().toISOString(),
      question: value,
    };

    setError('');
    setQuestion('');
    setPending(pendingMessage);
    setBusy(true);

    try {
      const response = await askExpoAi({ question: value, period, session_id: sessionId });
      const completedEntry: ChatEntry = {
        id: clientMessageId('answer'),
        timestamp: response.generated_at || new Date().toISOString(),
        question: value,
        answer: response.answer || 'A consulta foi concluída sem texto de resposta.',
        evidence: Array.isArray(response.evidence) ? response.evidence : [],
        limitations: Array.isArray(response.limitations) ? response.limitations : [],
        usedLlm: Boolean(response.used_llm),
        status: 'complete',
      };
      setHistory((previous) => [...previous, completedEntry]);
      setPending(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível consultar o assistente.';
      setHistory((previous) => [
        ...previous,
        {
          id: clientMessageId('error'),
          timestamp: new Date().toISOString(),
          question: value,
          answer: message,
          evidence: [],
          limitations: ['A consulta não foi concluída. Tente novamente; se o problema persistir, valide a disponibilidade da API.'],
          usedLlm: false,
          status: 'error',
        },
      ]);
      setPending(null);
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const clearHistory = async () => {
    if (!history.length || busy) return;
    setBusy(true);
    setError('');
    try {
      await clearExpoAiHistory(sessionId);
      setHistory([]);
      setPending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível limpar o histórico da IA.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ExpoShell
      title="Análises por IA"
      description="Copiloto operacional governado: evidências primeiro, resposta determinística quando possível e LLM apenas para contextualização textual."
    >
      {(data) => (
        <section className="grid min-w-0 gap-3.5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel title="Assistente Operacional" icon={Sparkles} className="min-w-0">
            <div className="min-h-[360px] space-y-3.5">
              {historyLoading ? (
                <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Recuperando histórico da sessão...
                </div>
              ) : history.length === 0 && !pending ? (
                <div className="rounded-[14px] border border-dashed border-border bg-surface/40 p-5">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Bot className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold">Pronto para analisar o período selecionado</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">A IA cita as evidências disponíveis e declara quando a cobertura ou a fonte não permite uma conclusão segura.</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {suggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={busy}
                        onClick={() => void submit(undefined, item)}
                        className="rounded-full border border-border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-primary/35 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {history.map((entry) => (
                <article key={entry.id} className="space-y-3">
                  <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground sm:max-w-[82%]">
                    {entry.question}
                  </div>
                  <div className={`max-w-[96%] rounded-2xl rounded-bl-md border p-4 sm:max-w-[88%] ${entry.status === 'error' ? 'border-critical/25 bg-critical/5' : 'border-border bg-surface/50'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Bot className={`h-4 w-4 ${entry.status === 'error' ? 'text-critical' : 'text-primary'}`} />
                      <span className={`text-xs font-semibold ${entry.status === 'error' ? 'text-critical' : 'text-primary'}`}>Copiloto Expo</span>
                      <StatusBadge
                        label={entry.status === 'error' ? 'Falha na consulta' : entry.usedLlm ? 'Texto revisado por LLM' : 'Resposta determinística'}
                        tone={entry.status === 'error' ? 'crit' : entry.usedLlm ? 'info' : 'ok'}
                      />
                      {entry.timestamp ? (
                        <span className="text-[10px] text-muted-foreground">
                          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(entry.timestamp))}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{entry.answer}</p>
                    {entry.evidence.length ? (
                      <div className="mt-4 rounded-2xl border border-border/80 bg-background/25 p-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary"><Database className="h-3.5 w-3.5" /></span>
                            <div>
                              <p className="text-xs font-semibold">Dados que sustentam a resposta</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">Valores consultados pelo Copiloto no período selecionado.</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                            {entry.evidence.length} {entry.evidence.length === 1 ? 'evidência' : 'evidências'}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {entry.evidence.map((evidence, index) => (
                            <EvidenceCard key={`${evidence.label}-${index}`} evidence={evidence} />
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {entry.limitations.length ? (
                      <div className="mt-4 rounded-xl border border-warning/20 bg-warning/5 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-warning">Limitações</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {entry.limitations.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}

              {pending ? (
                <article key={pending.id} className="space-y-3">
                  <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground sm:max-w-[82%]">
                    {pending.question}
                  </div>
                  <div role="status" aria-live="polite" className="max-w-[96%] rounded-2xl rounded-bl-md border border-primary/20 bg-primary/[0.035] p-4 sm:max-w-[88%]">
                    <div className="flex flex-wrap items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary">Copiloto Expo</span>
                      <StatusBadge label="Analisando dados" tone="pending" />
                      <span className="text-[10px] text-muted-foreground">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(pending.timestamp))}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-3.5 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">Analisando dados do período selecionado...</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Consultando evidências operacionais e preparando uma resposta governada para {data.period.label}.</p>
                      </div>
                    </div>
                  </div>
                </article>
              ) : null}

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {error ? <div className="mt-4 rounded-xl border border-critical/25 bg-critical/8 px-4 py-3 text-sm text-critical">{error}</div> : null}
            <form onSubmit={(event) => void submit(event)} className="mt-4 border-t border-border pt-4">
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value.slice(0, 800))}
                placeholder="Pergunte sobre CAG, chillers, bombas, hidrômetros ou qualidade dos dados..."
                className="min-h-[96px] resize-y"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Histórico salvo no workflow da sessão · período atual: {data.period.label}</p>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" disabled={!history.length || busy} onClick={() => void clearHistory()}>
                    <Eraser className="mr-2 h-4 w-4" /> Limpar histórico
                  </Button>
                  <Button type="submit" disabled={!question.trim() || busy}>
                    {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {busy ? 'Analisando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </form>
          </Panel>

          <div className="min-w-0 space-y-3.5">
            <Panel title="Governança da IA" icon={ShieldCheck}>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p><strong className="text-foreground">Sem causa raiz inventada.</strong> O modelo distingue fato medido, hipótese permitida e validação de campo.</p>
                <p><strong className="text-foreground">ΔT contextualizado.</strong> ΔT baixo isoladamente não caracteriza falha no Expo Center Norte.</p>
                <p><strong className="text-foreground">Cobertura acompanha a evidência.</strong> Leituras incompletas reduzem a confiança da resposta.</p>
                <p><strong className="text-foreground">Alarmes validados.</strong> Códigos Carrier/PRO-DIALOG só são tratados como mapeamento oficial após confirmação no BMS.</p>
              </div>
            </Panel>
            <Panel title="Contexto disponível" icon={Bot}>
              <div className="grid gap-2 text-xs">
                <div className="flex justify-between rounded-xl bg-surface p-3"><span className="text-muted-foreground">Chillers</span><strong>{data.cag.chillers.length}</strong></div>
                <div className="flex justify-between rounded-xl bg-surface p-3"><span className="text-muted-foreground">Grupos de bombas</span><strong>{data.cag.pumpGroups.length}</strong></div>
                <div className="flex justify-between rounded-xl bg-surface p-3"><span className="text-muted-foreground">Hidrômetros</span><strong>{data.water.meters.length}</strong></div>
                <div className="flex justify-between rounded-xl bg-surface p-3"><span className="text-muted-foreground">Fontes de qualidade</span><strong>{data.quality.sources.length}</strong></div>
              </div>
            </Panel>
          </div>
        </section>
      )}
    </ExpoShell>
  );
}
