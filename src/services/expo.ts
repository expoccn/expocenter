import { getAccessToken, notifyAuthExpired } from '@/lib/authStorage';
import { EXPO_API_BASE_URL, EXPO_PREVIEW_MODE } from '@/lib/expoConfig';
import { makeExpoPreviewData } from '@/data/expoPreview';
import type { PeriodType } from '@/types/api';
import type { ExpoDashboard, ExpoHealth, WaterDemonstrativeRequest } from '@/types/expo';

export type ExpoAiEvidence = {
  id?: string;
  label: string;
  value: unknown;
  source?: string;
};

export type ExpoAiChatResponse = {
  ok: boolean;
  action: 'chat';
  session_id: string;
  period: PeriodType | string;
  answer: string;
  evidence: ExpoAiEvidence[];
  limitations: string[];
  used_llm: boolean;
  intent?: string | null;
  generated_at?: string;
};

export type ExpoAiHistoryEntry = {
  id?: string;
  ts?: string;
  timestamp?: string;
  period?: PeriodType | string;
  question?: string;
  answer?: string;
  evidence?: ExpoAiEvidence[];
  limitations?: string[];
  used_llm?: boolean;
  intent?: string | null;
};

export type ExpoAiHistoryResponse = {
  ok: boolean;
  action: 'history';
  session_id: string;
  history: ExpoAiHistoryEntry[];
};

function safeApiMessage(message: string | undefined, status: number) {
  const fallback = status === 503
    ? 'Os dados ainda não estão disponíveis para a seleção atual.'
    : status === 404
      ? 'Nenhum dado foi encontrado para a seleção atual.'
      : status === 401
        ? 'Sua sessão expirou. Faça login novamente.'
        : 'Não foi possível concluir a solicitação.';

  if (!message) return fallback;
  if (/\b(n8n|redis|webhook|workflow|backend|postgres)\b/i.test(message)) return fallback;
  return message;
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const token = getAccessToken();

  try {
    const response = await fetch(`${EXPO_API_BASE_URL}${path}`, {
      cache: 'no-store',
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });

    if (response.status === 401) notifyAuthExpired();

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error(`Resposta inválida da API (${response.status}).`);
      }
    }

    if (!response.ok) {
      const errorBody = (body || {}) as { message?: string; error?: string };
      throw new Error(safeApiMessage(errorBody.message || errorBody.error, response.status));
    }

    return body as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao consultar a API do Expo Center Norte.');
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function daysLag(referenceDate: string | null | undefined) {
  if (!referenceDate) return null;
  const match = String(referenceDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const referenceUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((todayUtc - referenceUtc) / 86_400_000));
}

function normalizeDashboardFreshness(data: ExpoDashboard): ExpoDashboard {
  if (data.header.previewMode) return data;
  const lag = daysLag(data.period.referenceDate);
  if (lag != null && lag > 1 && data.header.dataFreshness !== 'STALE') {
    return {
      ...data,
      header: {
        ...data.header,
        dataFreshness: 'STALE',
      },
    };
  }
  return data;
}

export async function fetchExpoDashboard(period: PeriodType): Promise<ExpoDashboard> {
  if (EXPO_PREVIEW_MODE) return makeExpoPreviewData(period);
  const data = await request<ExpoDashboard>(`/dashboard?period=${encodeURIComponent(period)}`);
  return normalizeDashboardFreshness(data);
}

export async function fetchExpoHealth(): Promise<ExpoHealth> {
  if (EXPO_PREVIEW_MODE) {
    return {
      ok: true,
      service: 'Expo Center Norte Frontend Preview',
      checkedAt: new Date().toISOString(),
      previewMode: true,
    };
  }
  return request<ExpoHealth>('/health');
}

export async function askExpoAi(payload: { question: string; period: PeriodType; session_id: string }): Promise<ExpoAiChatResponse> {
  if (EXPO_PREVIEW_MODE) {
    const preview = makeExpoPreviewData(payload.period);
    return {
      ok: true,
      action: 'chat',
      session_id: payload.session_id,
      period: payload.period,
      answer: 'Modo de homologação: a interface da IA está pronta. A resposta operacional real será fornecida pelo CORE IA quando os workflows Expo V2 forem ativados.',
      evidence: [
        { label: 'Cobertura geral', value: `${preview.quality.overallCoveragePct?.toFixed(1).replace('.', ',')}%`, source: 'preview' },
        { label: 'Chillers modelados', value: preview.cag.chillers.length, source: 'preview' },
        { label: 'Hidrômetros modelados', value: preview.water.meters.length, source: 'preview' },
      ],
      limitations: ['Dados apresentados nesta instalação são de homologação visual.', 'ΔT baixo isoladamente não constitui falha.', 'Códigos de alarme exigem validação do mapeamento instalado.'],
      used_llm: false,
      generated_at: new Date().toISOString(),
    };
  }

  return request<ExpoAiChatResponse>('/ai-chat', {
    method: 'POST',
    body: JSON.stringify({ ...payload, source: 'frontend-ai-v2' }),
  }, 120000);
}

export async function fetchExpoAiHistory(sessionId: string): Promise<ExpoAiHistoryResponse> {
  if (EXPO_PREVIEW_MODE) {
    return { ok: true, action: 'history', session_id: sessionId, history: [] };
  }
  return request<ExpoAiHistoryResponse>(`/ai-history?session_id=${encodeURIComponent(sessionId)}`, undefined, 30000);
}

export async function clearExpoAiHistory(sessionId: string): Promise<void> {
  if (EXPO_PREVIEW_MODE) return;
  await request('/ai-clear', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  }, 30000);
}

type DownloadOptions = {
  path: string;
  mime: string;
  fallbackName: string;
  method?: 'GET' | 'POST';
  body?: string;
};

async function downloadBinary({ path, mime, fallbackName, method = 'GET', body }: DownloadOptions) {
  if (typeof document === 'undefined') throw new Error('Download disponível somente no navegador.');

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 180000);
  const token = getAccessToken();

  try {
    const response = await fetch(`${EXPO_API_BASE_URL}${path}`, {
      method,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: mime,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body } : {}),
    });

    if (response.status === 401) notifyAuthExpired();
    if (!response.ok) {
      let message: string | undefined;
      try {
        const raw = await response.text();
        if (raw) {
          const parsed = JSON.parse(raw) as { message?: string; error?: string };
          message = parsed.message || parsed.error;
        }
      } catch {
        // Usa mensagem segura.
      }
      throw new Error(safeApiMessage(message, response.status));
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes(mime.toLowerCase())) {
      throw new Error('A API respondeu sem o arquivo esperado.');
    }

    const blob = await response.blob();
    if (!blob.size) throw new Error('O arquivo retornado está vazio.');

    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename\*=UTF-8''([^;]+)/i) || disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] ? decodeURIComponent(match[1]).replace(/[\\/]/g, '-') : fallbackName;
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('A geração do arquivo excedeu o tempo limite.');
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

const cagPdfPaths = {
  daily: '/report-daily-pdf',
  weekly: '/report-weekly-pdf',
  monthly: '/report-monthly-pdf',
} as const;

export async function downloadCagReport(type: 'daily' | 'weekly' | 'monthly', format: 'pdf' | 'pptx') {
  if (EXPO_PREVIEW_MODE) throw new Error('Geração de relatórios está desabilitada no modo de homologação visual.');

  const path = format === 'pdf'
    ? cagPdfPaths[type]
    : `/reports/cag/${type}/pptx`;
  const mime = format === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

  return downloadBinary({
    path,
    mime,
    fallbackName: `EXPO_CENTER_NORTE_CAG_${type.toUpperCase()}.${format}`,
  });
}

export async function downloadWaterDemonstrative(payload: WaterDemonstrativeRequest) {
  if (EXPO_PREVIEW_MODE) throw new Error('Geração de demonstrativo está desabilitada no modo de homologação visual.');

  return downloadBinary({
    path: '/water/demonstrative',
    mime: 'application/pdf',
    fallbackName: `EXPO_CENTER_NORTE_AGUA_${payload.reportType.toUpperCase()}.pdf`,
    method: 'POST',
    body: JSON.stringify({
      local_id: payload.localId,
      data_inicio: payload.startDate,
      hora_inicio: payload.startTime,
      data_fim: payload.endDate,
      hora_fim: payload.endTime,
      tipo_relatorio: payload.reportType,
      tarifa_m3: payload.tariffM3,
    }),
  });
}

export async function downloadWaterMonthlyReport(format: 'pdf' | 'pptx' = 'pdf') {
  if (EXPO_PREVIEW_MODE) throw new Error('Geração do relatório mensal de hidrômetros está desabilitada no modo de homologação visual.');

  return downloadBinary({
    path: `/reports/water/monthly/${format}`,
    mime: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fallbackName: `EXPO_CENTER_NORTE_HIDROMETROS_MENSAL.${format}`,
  });
}
