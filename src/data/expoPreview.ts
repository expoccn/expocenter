import type { PeriodType } from '@/types/api';
import type { ExpoDashboard } from '@/types/expo';

const datesByPeriod: Record<PeriodType, { label: string; start: string; end: string }> = {
  d1: { label: 'Último dia', start: '2026-08-24', end: '2026-08-24' },
  '7d': { label: '7 dias', start: '2026-08-18', end: '2026-08-24' },
  '30d': { label: '30 dias', start: '2026-07-26', end: '2026-08-24' },
};

const meters = [
  ['pavilhao_vermelho_a', 'Pavilhão Vermelho A', 'Pavilhão Vermelho A', 'POTAVEL', 12.8, 100, 'OK', 7142.3],
  ['pavilhao_verde_a', 'Pavilhão Verde A', 'Pavilhão Verde A', 'POTAVEL', 19.9, 100, 'OK', 2122.8],
  ['pavilhao_vermelho_a_reuso', 'Pavilhão Vermelho A Reúso', 'Pavilhão Vermelho A', 'REUSO', 5.1, 100, 'OK', 840.6],
  ['pavilhao_verde_a_reuso', 'Pavilhão Verde A Reúso', 'Pavilhão Verde A', 'REUSO', 7.4, 100, 'OK', 1048.7],
  ['pavilhao_vermelho_b', 'Pavilhão Vermelho B', 'Pavilhão Vermelho B', 'POTAVEL', 8.6, 100, 'OK', 1758.4],
  ['pavilhao_verde_b', 'Pavilhão Verde B', 'Pavilhão Verde B', 'POTAVEL', 10.4, 100, 'OK', 1938.2],
  ['pavilhao_branco_b', 'Pavilhão Branco B', 'Pavilhão Branco B', 'POTAVEL', 6.8, 100, 'OK', 1651.9],
  ['pavilhao_vermelho_b_reuso', 'Pavilhão Vermelho B Reúso', 'Pavilhão Vermelho B', 'REUSO', 3.2, 100, 'OK', 602.1],
  ['pavilhao_verde_b_reuso', 'Pavilhão Verde B Reúso', 'Pavilhão Verde B', 'REUSO', 4.0, 100, 'OK', 711.2],
  ['pavilhao_branco_b_reuso', 'Pavilhão Branco B Reúso', 'Pavilhão Branco B', 'REUSO', 2.5, 100, 'OK', 530.8],
  ['pavilhao_amarelo_otto', 'Pavilhão Amarelo Otto', 'Pavilhão Amarelo Otto', 'POTAVEL', 10.0, 100, 'OK', 2259.4],
  ['caminhao_pipa', 'Caminhão Pipa', 'Caminhão Pipa', 'POTAVEL', 0, 100, 'OK', 182.0],
  ['pavilhao_azul_reuso', 'Pavilhão Azul Reúso', 'Pavilhão Azul', 'REUSO', null, 0, 'COMM_ERROR', null],
  ['pavilhao_branco_reuso', 'Pavilhão Branco Reúso', 'Pavilhão Branco', 'REUSO', null, 0, 'COMM_ERROR', null],
  ['centro_de_convencoes_reuso', 'Centro de Convenções Reúso', 'Centro de Convenções', 'REUSO', null, 0, 'COMM_ERROR', null],
  ['pavilhao_azul', 'Pavilhão Azul', 'Pavilhão Azul', 'POTAVEL', 17.8, 100, 'OK', 5900.2],
  ['centro_de_convencoes', 'Centro de Convenções', 'Centro de Convenções', 'POTAVEL', 14.3, 100, 'OK', 3491.0],
] as const;

function scale(period: PeriodType) {
  return period === 'd1' ? 1 : period === '7d' ? 6.7 : 27.8;
}

export function makeExpoPreviewData(period: PeriodType): ExpoDashboard {
  const span = datesByPeriod[period];
  const factor = scale(period);

  const waterMeters = meters.map(([id, label, pavillion, type, consumption, coverage, status, lastReading]) => ({
    id,
    label,
    pavillion,
    type,
    consumptionM3: consumption == null ? null : Number((consumption * factor).toFixed(1)),
    coveragePct: coverage,
    status,
    lastReadingM3: lastReading,
    note: status === 'COMM_ERROR' ? 'Sem comunicação no arquivo de homologação.' : null,
  }));

  const total = waterMeters.reduce((sum, meter) => sum + (meter.consumptionM3 ?? 0), 0);
  const reuse = waterMeters.filter((meter) => meter.type === 'REUSO').reduce((sum, meter) => sum + (meter.consumptionM3 ?? 0), 0);

  return {
    schemaVersion: 'expo-dashboard-v2-preview',
    period: {
      type: period,
      label: span.label,
      startDate: span.start,
      endDate: span.end,
      referenceDate: span.end,
    },
    header: {
      site: 'Expo Center Norte',
      generatedAt: '2026-08-25T14:45:00-03:00',
      previewMode: true,
      dataFreshness: 'PREVIEW',
      coveragePct: 64.3,
      activeAlarms: 2,
      attentionCount: 5,
    },
    cag: {
      chillers: [
        {
          id: 'azul', label: 'Chiller Azul', state: 'STOPPED', capacityPct: 0, circuitAPct: 0, circuitBPct: 0,
          waterInC: 18.1, waterOutC: 17.8, deltaTC: 0.3, setpointC: 7, externalTempC: 21.5,
          suctionA: 418, suctionB: 421, dischargeA: 838, dischargeB: 844, oil1: 417, oil2: 420,
          alarmCode: '12', coveragePct: 36.5, compressorCount: 0, operatingHours: 0,
          note: 'Amostras válidas concentradas no fim do dia; diagnóstico limitado pela cobertura.',
        },
        {
          id: 'branco', label: 'Chiller Branco', state: 'INSUFFICIENT_DATA', capacityPct: 0, circuitAPct: 0, circuitBPct: 0,
          waterInC: null, waterOutC: null, deltaTC: null, setpointC: 7, externalTempC: 21.3,
          suctionA: 420, suctionB: 423, dischargeA: 840, dischargeB: 846, oil1: 421, oil2: -302.47,
          alarmCode: '19', coveragePct: 18.7, compressorCount: null, operatingHours: null,
          note: 'Pressão de óleo CPR2 A exige validação de escala/mapeamento antes de uso técnico.',
        },
        {
          id: 'vermelho', label: 'Chiller Vermelho', state: 'OPERATING', capacityPct: 18.8, circuitAPct: 12.5, circuitBPct: 6.3,
          waterInC: 12.4, waterOutC: 8.8, deltaTC: 3.6, setpointC: 7, externalTempC: 22.0,
          suctionA: 426, suctionB: 430, dischargeA: 862, dischargeB: 868, oil1: 432, oil2: 435,
          alarmCode: '0', coveragePct: 36.5, compressorCount: 2, operatingHours: 3.0,
          note: 'Operação observada em parte da tarde. ΔT deve ser contextualizado com carga térmica e ocupação.',
        },
      ],
      pumpGroups: ['azul', 'branco', 'vermelho'].map((id, groupIndex) => ({
        id: id as 'azul' | 'branco' | 'vermelho',
        label: `Bombas ${id.charAt(0).toUpperCase()}${id.slice(1)}`,
        pressure: groupIndex === 2 ? 1.72 : 0.32,
        pressureSetpoint: 1.8,
        bypassPct: groupIndex === 2 ? 28 : 8,
        coveragePct: 36.5,
        pumps: [1,2,3,4].map((n) => ({
          id: `${id}-bag${n}`,
          label: `BAG ${n}`,
          state: groupIndex === 2 && [1,3,4].includes(n) ? 'ON' as const : 'OFF' as const,
          remote: true,
          alarm: false,
        })),
      })),
      trends: Array.from({ length: period === 'd1' ? 12 : 14 }, (_, index) => ({
        label: period === 'd1' ? `${String(index * 2).padStart(2, '0')}:00` : `${index + 1}/${period === '7d' ? '08' : '08'}`,
        inlet: 11.8 + Math.sin(index / 2) * 0.8,
        outlet: 8.1 + Math.sin(index / 2 + 0.5) * 0.5,
        deltaT: 3.3 + Math.sin(index / 2.4) * 0.7,
        capacity: 14 + Math.max(0, Math.sin(index / 2.2)) * 12,
        pressure: 1.68 + Math.sin(index / 3) * 0.08,
        waterConsumption: 5 + Math.max(0, Math.sin(index / 1.8)) * 3.5,
      })),
    },
    water: {
      totalM3: Number(total.toFixed(1)),
      potableM3: Number((total - reuse).toFixed(1)),
      reuseM3: Number(reuse.toFixed(1)),
      reusePct: total ? Number(((reuse / total) * 100).toFixed(1)) : 0,
      nightM3: Number((total * 0.09).toFixed(1)),
      window1018M3: Number((total * 0.58).toFixed(1)),
      meters: waterMeters,
      trends: Array.from({ length: period === 'd1' ? 12 : 14 }, (_, index) => ({
        label: period === 'd1' ? `${String(index * 2).padStart(2, '0')}:00` : `${index + 1}/08`,
        inlet: null, outlet: null, deltaT: null, capacity: null, pressure: null,
        waterConsumption: Number((4.5 + Math.max(0, Math.sin(index / 1.7)) * 4.2).toFixed(1)),
      })),
    },
    quality: {
      overallCoveragePct: 64.3,
      sources: [
        { id: 'chiller-azul', label: 'Chiller Azul', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED', note: 'No samples in range em parte do dia.' },
        { id: 'chiller-branco', label: 'Chiller Branco', received: true, coveragePct: 18.7, validSamples: 18, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED', note: 'Temperaturas com cobertura especialmente baixa.' },
        { id: 'chiller-vermelho', label: 'Chiller Vermelho', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
        { id: 'bombas-azul', label: 'Bombas Azul', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
        { id: 'bombas-branco', label: 'Bombas Branco', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
        { id: 'bombas-vermelho', label: 'Bombas Vermelho', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
        { id: 'hidrometros', label: 'Hidrômetros', received: true, coveragePct: 82.4, validSamples: 14, expectedSamples: 17, lastSampleAt: `${span.end}T23:00:00-03:00`, status: 'DEGRADED', note: '3 hidrômetros de reúso sem comunicação no arquivo de homologação.' },
      ],
    },
    attention: [
      { id: 'coverage', title: 'Cobertura parcial nos arquivos CAG', detail: 'Os arquivos de homologação têm lacunas importantes. A ausência de amostra não é tratada como zero.', tone: 'warn', source: 'Qualidade' },
      { id: 'branco-oil', title: 'Validar mapeamento do Chiller Branco', detail: 'Pressão de óleo CPR2 A apresenta valor incompatível com a faixa esperada e está bloqueada para diagnóstico.', tone: 'crit', source: 'Chiller Branco' },
      { id: 'water-comm', title: '3 hidrômetros sem comunicação', detail: 'Pavilhão Azul Reúso, Pavilhão Branco Reúso e Centro de Convenções Reúso.', tone: 'warn', source: 'Hidrômetros' },
      { id: 'alarm-map', title: 'Códigos de alarme ainda exigem validação de mapeamento', detail: 'Não interpretar códigos 12/19 como causa raiz sem confirmar remapeamento BMS/PRO-DIALOG.', tone: 'info', source: 'CAG' },
      { id: 'dt-guardrail', title: 'ΔT baixo depende do contexto de carga', detail: 'No Expo Center Norte, baixa ocupação/eventos pode reduzir a carga térmica. ΔT isolado não caracteriza falha.', tone: 'info', source: 'Governança IA' },
    ],
  };
}
