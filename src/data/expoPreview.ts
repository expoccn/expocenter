import type { PeriodType } from '@/types/api';
import type { ExpoChiller, ExpoDashboard, ExpoPumpGroup, ExpoWaterMeter } from '@/types/expo';

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

function trendLabels(period: PeriodType) {
  const count = period === 'd1' ? 12 : period === '7d' ? 7 : 14;
  return Array.from({ length: count }, (_, index) => period === 'd1' ? `${String(index * 2).padStart(2, '0')}:00` : `${String(index + 1).padStart(2, '0')}/08`);
}

export function makeExpoPreviewData(period: PeriodType): ExpoDashboard {
  const span = datesByPeriod[period];
  const factor = scale(period);
  const labels = trendLabels(period);

  const waterMeters: ExpoWaterMeter[] = meters.map(([id, label, pavillion, type, consumption, coverage, status, lastReading]) => ({
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
  const potable = total - reuse;

  const chillers: ExpoChiller[] = [
    {
      id: 'azul', label: 'Chiller Azul', state: 'STOPPED', capacityPct: 0, circuitAPct: 0, circuitBPct: 0,
      waterInC: 18.1, waterOutC: 17.8, deltaTC: 0.3, setpointC: 7, externalTempC: 21.5,
      suctionA: 418, suctionB: 421, dischargeA: 838, dischargeB: 844,
      oilA1: 417, oilA2: 419, oilB1: 420, oilB2: 422, oil1: 417, oil2: 420,
      alarmCode: '12', coveragePct: 36.5, compressorCount: 0, operatingHours: 0, stoppedHours: 24 * factor, alarmHours: 0.25 * factor, starts: 0,
      note: 'Amostras válidas concentradas no fim do dia; diagnóstico limitado pela cobertura.',
    },
    {
      id: 'branco', label: 'Chiller Branco', state: 'INSUFFICIENT_DATA', capacityPct: 0, circuitAPct: 0, circuitBPct: 0,
      waterInC: null, waterOutC: null, deltaTC: null, setpointC: 7, externalTempC: 21.3,
      suctionA: 420, suctionB: 423, dischargeA: 840, dischargeB: 846,
      oilA1: 421, oilA2: -302.47, oilB1: 423, oilB2: 425, oil1: 421, oil2: 423,
      alarmCode: '19', coveragePct: 18.7, compressorCount: null, operatingHours: null, stoppedHours: null, alarmHours: 9 * factor, starts: null,
      note: 'Pressão de óleo CPR2 A exige validação de escala/mapeamento antes de uso técnico.',
    },
    {
      id: 'vermelho', label: 'Chiller Vermelho', state: 'OPERATING', capacityPct: 18.8, circuitAPct: 12.5, circuitBPct: 6.3,
      waterInC: 12.4, waterOutC: 8.8, deltaTC: 3.6, setpointC: 7, externalTempC: 22.0,
      suctionA: 426, suctionB: 430, dischargeA: 862, dischargeB: 868,
      oilA1: 432, oilA2: 434, oilB1: 435, oilB2: 437, oil1: 432, oil2: 435,
      alarmCode: null, coveragePct: 36.5, compressorCount: 2, operatingHours: 3.0 * factor, stoppedHours: 21 * factor, alarmHours: 0, starts: Math.max(1, Math.round(factor)),
      note: 'Operação observada em parte da tarde. ΔT deve ser contextualizado com carga térmica e ocupação.',
    },
  ];

  const pumpGroups: ExpoPumpGroup[] = ['azul', 'branco', 'vermelho'].map((id, groupIndex) => ({
    id: id as 'azul' | 'branco' | 'vermelho',
    label: `Bombas ${id.charAt(0).toUpperCase()}${id.slice(1)}`,
    pressure: groupIndex === 2 ? 1.72 : 0.32,
    pressureSetpoint: 1.8,
    bypassPct: groupIndex === 2 ? 28 : 8,
    coveragePct: 36.5,
    localHoursTotal: 0,
    alarmHoursTotal: 0,
    startsTotal: groupIndex === 2 ? 3 : 0,
    pumps: [1, 2, 3, 4].map((num) => ({
      id: `${id}-bag${num}`,
      label: `BAG ${num}`,
      state: groupIndex === 2 && [1, 3, 4].includes(num) ? 'ON' as const : 'OFF' as const,
      remote: true,
      alarm: false,
      operatingHours: groupIndex === 2 && [1, 3, 4].includes(num) ? 3 * factor : 0,
      stoppedHours: groupIndex === 2 && [1, 3, 4].includes(num) ? 21 * factor : 24 * factor,
      localHours: 0,
      remoteHours: 24 * factor,
      alarmHours: 0,
      starts: groupIndex === 2 && [1, 3, 4].includes(num) ? Math.max(1, Math.round(factor)) : 0,
    })),
  }));

  const chillerWaterSeries = chillers.map((chiller, groupIndex) => ({
    id: chiller.id,
    label: chiller.label,
    series: labels.map((label, index) => ({
      label,
      timestamp: `${span.end}T${period === 'd1' ? String(index * 2).padStart(2, '0') : '00'}:00:00`,
      inlet: chiller.id === 'branco' ? null : Number((11.8 + groupIndex * 0.6 + Math.sin(index / 2) * 0.8).toFixed(2)),
      outlet: chiller.id === 'branco' ? null : Number((8.1 + groupIndex * 0.25 + Math.sin(index / 2 + 0.5) * 0.5).toFixed(2)),
      setpoint: 7,
      deltaT: chiller.id === 'branco' ? null : Number((3.3 + Math.sin(index / 2.4) * 0.7).toFixed(2)),
    })),
  }));

  const chillerCapacitySeries = chillers.map((chiller, groupIndex) => ({
    id: chiller.id,
    label: chiller.label,
    series: labels.map((label, index) => {
      const totalCapacity = chiller.id === 'vermelho' ? Number((12 + Math.max(0, Math.sin(index / 2.2)) * 18).toFixed(1)) : 0;
      return { label, timestamp: null, total: totalCapacity, circuitA: Number((totalCapacity * 0.65).toFixed(1)), circuitB: Number((totalCapacity * 0.35).toFixed(1)) };
    }),
  }));

  const chillerPressureSeries = chillers.map((chiller, groupIndex) => ({
    id: chiller.id,
    label: chiller.label,
    series: labels.map((label, index) => ({
      label,
      timestamp: null,
      suctionA: Number((410 + groupIndex * 8 + Math.sin(index / 2) * 12).toFixed(1)),
      dischargeA: Number((820 + groupIndex * 12 + Math.sin(index / 2.2) * 18).toFixed(1)),
      suctionB: Number((416 + groupIndex * 8 + Math.sin(index / 2.3) * 11).toFixed(1)),
      dischargeB: Number((830 + groupIndex * 12 + Math.sin(index / 2.4) * 18).toFixed(1)),
    })),
  }));

  const pumpAnalytics = pumpGroups.map((group, groupIndex) => ({
    id: group.id,
    label: group.label,
    pressureSeries: labels.map((label, index) => ({ label, timestamp: null, pressure: Number(((groupIndex === 2 ? 1.7 : 0.3) + Math.sin(index / 3) * 0.08).toFixed(2)), setpoint: 1.8 })),
    bypassSeries: labels.map((label, index) => ({ label, timestamp: null, bypass: Number(((groupIndex === 2 ? 26 : 8) + Math.sin(index / 2.7) * 4).toFixed(1)) })),
    activitySeries: labels.map((label, index) => ({ label, timestamp: null, bag1: groupIndex === 2 && index > 2 && index < labels.length - 2 ? 1 : 0, bag2: 0, bag3: groupIndex === 2 && index > 4 ? 1 : 0, bag4: groupIndex === 2 && index > 5 ? 1 : 0 })),
  }));

  const pavMap = new Map<string, { id: string; label: string; totalM3: number | null; potableM3: number | null; reuseM3: number | null; validMeters: number; attentionMeters: number }>();
  for (const meter of waterMeters) {
    const current = pavMap.get(meter.pavillion) || { id: meter.pavillion.toLowerCase().replace(/\s+/g, '-'), label: meter.pavillion, totalM3: null, potableM3: null, reuseM3: null, validMeters: 0, attentionMeters: 0 };
    if (meter.consumptionM3 != null) {
      current.totalM3 = (current.totalM3 ?? 0) + meter.consumptionM3;
      if (meter.type === 'REUSO') current.reuseM3 = (current.reuseM3 ?? 0) + meter.consumptionM3;
      else current.potableM3 = (current.potableM3 ?? 0) + meter.consumptionM3;
      current.validMeters += 1;
    }
    if (meter.status !== 'OK') current.attentionMeters += 1;
    pavMap.set(meter.pavillion, current);
  }
  const pavillions = [...pavMap.values()].sort((a, b) => (b.totalM3 ?? -1) - (a.totalM3 ?? -1));
  const topMeters = waterMeters.filter((meter) => meter.consumptionM3 != null).map((meter) => ({ id: meter.id, label: meter.label, pavillion: meter.pavillion, type: meter.type, consumptionM3: meter.consumptionM3 })).sort((a, b) => (b.consumptionM3 ?? -1) - (a.consumptionM3 ?? -1)).slice(0, 10);

  const qualitySources: ExpoDashboard['quality']['sources'] = [
    { id: 'chiller-azul', label: 'Chiller Azul', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED', note: 'No samples in range em parte do dia.' },
    { id: 'chiller-branco', label: 'Chiller Branco', received: true, coveragePct: 18.7, validSamples: 18, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED', note: 'Temperaturas com cobertura especialmente baixa.' },
    { id: 'chiller-vermelho', label: 'Chiller Vermelho', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
    { id: 'bombas-azul', label: 'Bombas Azul', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
    { id: 'bombas-branco', label: 'Bombas Branco', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
    { id: 'bombas-vermelho', label: 'Bombas Vermelho', received: true, coveragePct: 36.5, validSamples: 35, expectedSamples: 96, lastSampleAt: `${span.end}T23:45:00-03:00`, status: 'DEGRADED' },
    ...waterMeters.map((meter) => ({ id: `water-${meter.id}`, label: meter.label, received: meter.status !== 'COMM_ERROR' && meter.status !== 'NO_DATA', coveragePct: meter.coveragePct, validSamples: null, expectedSamples: null, lastSampleAt: `${span.end}T23:00:00-03:00`, status: meter.status === 'ANOMALY' ? 'DEGRADED' as const : meter.status, note: meter.note })),
  ];

  return {
    schemaVersion: 'expo-dashboard-v2.3-preview',
    period: { type: period, label: span.label, startDate: span.start, endDate: span.end, referenceDate: span.end },
    header: { site: 'Expo Center Norte', generatedAt: '2026-08-25T14:45:00-03:00', previewMode: true, dataFreshness: 'PREVIEW', coveragePct: 64.3, activeAlarms: 2, attentionCount: 5 },
    cag: {
      chillers,
      pumpGroups,
      trends: chillerWaterSeries.flatMap((group) => group.series.map((point) => ({ label: `${group.id.charAt(0).toUpperCase()}${group.id.slice(1)} ${point.label}`, inlet: point.inlet, outlet: point.outlet, deltaT: point.deltaT, capacity: null, pressure: null, waterConsumption: null }))),
      analytics: {
        chillerOperation: chillers.map((item) => ({ id: item.id, label: item.label, operatingHours: item.operatingHours, stoppedHours: item.stoppedHours, alarmHours: item.alarmHours, starts: item.starts, coveragePct: item.coveragePct })),
        chillerCapacity: chillers.map((item) => ({ id: item.id, label: item.label, total: item.capacityPct, circuitA: item.circuitAPct, circuitB: item.circuitBPct })),
        water: chillerWaterSeries,
        capacity: chillerCapacitySeries,
        pressures: chillerPressureSeries,
        pumps: pumpAnalytics,
      },
    },
    water: {
      totalM3: Number(total.toFixed(1)),
      potableM3: Number(potable.toFixed(1)),
      reuseM3: Number(reuse.toFixed(1)),
      reusePct: total ? Number(((reuse / total) * 100).toFixed(1)) : 0,
      nightM3: Number((total * 0.09).toFixed(1)),
      window1018M3: Number((total * 0.58).toFixed(1)),
      meters: waterMeters,
      trends: labels.map((label, index) => ({ label, inlet: null, outlet: null, deltaT: null, capacity: null, pressure: null, waterConsumption: Number((4.5 + Math.max(0, Math.sin(index / 1.7)) * 4.2).toFixed(1)) })),
      analytics: {
        pavillions,
        topMeters,
        mix: [{ id: 'potable', label: 'Potável', valueM3: Number(potable.toFixed(1)) }, { id: 'reuse', label: 'Reúso', valueM3: Number(reuse.toFixed(1)) }],
        timeWindows: [
          { id: 'night', label: 'Noturno (0h–6h)', valueM3: Number((total * 0.09).toFixed(1)) },
          { id: '1018', label: 'Janela 10h–18h', valueM3: Number((total * 0.58).toFixed(1)) },
          { id: 'other', label: 'Demais horários', valueM3: Number((total * 0.33).toFixed(1)) },
        ],
      },
    },
    quality: {
      overallCoveragePct: 64.3,
      sources: qualitySources,
      analytics: {
        statusBreakdown: [
          { status: 'OK', label: 'OK', count: qualitySources.filter((source) => source.status === 'OK').length },
          { status: 'DEGRADED', label: 'Degradada', count: qualitySources.filter((source) => source.status === 'DEGRADED').length },
          { status: 'NO_DATA', label: 'Sem dados', count: qualitySources.filter((source) => source.status === 'NO_DATA').length },
          { status: 'COMM_ERROR', label: 'Falha comunicação', count: qualitySources.filter((source) => source.status === 'COMM_ERROR').length },
        ],
        cagAvailabilityHistory: labels.map((label, index) => ({ date: span.end, label, availableSources: index % 6 === 0 ? 5 : 6, expectedSources: 6, availabilityPct: index % 6 === 0 ? 83.3 : 100 })),
      },
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
