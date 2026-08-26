import type { PeriodType } from '@/types/api';

export type ExpoTone = 'ok' | 'warn' | 'crit' | 'info' | 'pending';

export interface ExpoSourceQuality {
  id: string;
  label: string;
  received: boolean;
  coveragePct: number | null;
  validSamples: number | null;
  expectedSamples: number | null;
  lastSampleAt: string | null;
  status: 'OK' | 'DEGRADED' | 'NO_DATA' | 'COMM_ERROR';
  note?: string | null;
}

export interface ExpoChiller {
  id: 'azul' | 'branco' | 'vermelho';
  label: string;
  state: 'OPERATING' | 'STOPPED' | 'INSUFFICIENT_DATA';
  capacityPct: number | null;
  circuitAPct: number | null;
  circuitBPct: number | null;
  waterInC: number | null;
  waterOutC: number | null;
  deltaTC: number | null;
  setpointC: number | null;
  externalTempC: number | null;
  suctionA: number | null;
  suctionB: number | null;
  dischargeA: number | null;
  dischargeB: number | null;
  oil1: number | null;
  oil2: number | null;
  alarmCode: string | null;
  coveragePct: number | null;
  compressorCount: number | null;
  operatingHours: number | null;
  note?: string | null;
}

export interface ExpoPump {
  id: string;
  label: string;
  state: 'ON' | 'OFF' | 'NO_DATA';
  remote: boolean | null;
  alarm: boolean | null;
}

export interface ExpoPumpGroup {
  id: 'azul' | 'branco' | 'vermelho';
  label: string;
  pressure: number | null;
  pressureSetpoint: number | null;
  bypassPct: number | null;
  coveragePct: number | null;
  pumps: ExpoPump[];
}

export interface ExpoTrendPoint {
  label: string;
  inlet: number | null;
  outlet: number | null;
  deltaT: number | null;
  capacity: number | null;
  pressure: number | null;
  waterConsumption: number | null;
}

export interface ExpoWaterMeter {
  id: string;
  label: string;
  pavillion: string;
  type: 'POTAVEL' | 'REUSO';
  consumptionM3: number | null;
  coveragePct: number | null;
  status: 'OK' | 'NO_DATA' | 'COMM_ERROR' | 'ANOMALY';
  lastReadingM3: number | null;
  note?: string | null;
}

export interface ExpoDashboard {
  schemaVersion: string;
  period: {
    type: PeriodType;
    label: string;
    startDate: string;
    endDate: string;
    referenceDate: string;
  };
  header: {
    site: string;
    generatedAt: string;
    previewMode: boolean;
    dataFreshness: 'CURRENT' | 'STALE' | 'PREVIEW';
    coveragePct: number | null;
    activeAlarms: number;
    attentionCount: number;
  };
  cag: {
    chillers: ExpoChiller[];
    pumpGroups: ExpoPumpGroup[];
    trends: ExpoTrendPoint[];
  };
  water: {
    totalM3: number | null;
    potableM3: number | null;
    reuseM3: number | null;
    reusePct: number | null;
    nightM3: number | null;
    window1018M3: number | null;
    meters: ExpoWaterMeter[];
    trends: ExpoTrendPoint[];
  };
  quality: {
    overallCoveragePct: number | null;
    sources: ExpoSourceQuality[];
  };
  attention: Array<{
    id: string;
    title: string;
    detail: string;
    tone: ExpoTone;
    source: string;
  }>;
}

export interface ExpoHealth {
  ok: boolean;
  service: string;
  checkedAt: string;
  previewMode: boolean;
}

export interface WaterDemonstrativeRequest {
  localId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reportType: 'cliente' | 'tecnico';
  tariffM3: number;
}
