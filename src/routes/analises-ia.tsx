import { createFileRoute } from '@tanstack/react-router';
import { Bot, Eraser, LoaderCircle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { Panel } from '@/components/dashboard/Panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { usePeriod } from '@/context/PeriodContext';
import { askExpoAi, clearExpoAiHistory, fetchExpoAiHistory, type ExpoAiHistoryEntry } from '@/services/expo';
import { getOrCreateAiSessionId } from '@/lib/aiSession';

export const Route = createFileRoute('/analises-ia')({ component: AiPage });

type ChatEntry = {
  id: string;
  timestamp: string | null;
  question: string;
  answer: string;
  evidence: Array<{ label: string; value: unknown; source?: string }>;
  limitations: string[];
  usedLlm: boolean;
  status: 'complete' | 'error';
};

type PendingChat = {
  id: string;
  timestamp: string;
  question: string;
};

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
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Evidências</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {entry.evidence.map((evidence, index) => (
                            <div key={`${evidence.label}-${index}`} className="rounded-xl border border-border bg-card p-3 text-xs">
                              <p className="font-semibold">{evidence.label}</p>
                              <p className="mt-1 break-words text-muted-foreground">
                                {typeof evidence.value === 'object' ? JSON.stringify(evidence.value) : String(evidence.value ?? 'N/D')}
                                {evidence.source ? ` · ${evidence.source}` : ''}
                              </p>
                            </div>
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
