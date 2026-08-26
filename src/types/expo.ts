import type { PeriodType } from '@/types/api';

export type ExpoTone = 'ok' | 'warn' | 'crit' | 'info' | 'pending';
export type ExpoCagGroupId = 'azul' | 'branco' | 'vermelho';

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
  id: ExpoCagGroupId;
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
  oilA1: number | null;
  oilA2: number | null;
  oilB1: number | null;
  oilB2: number | null;
  oil1: number | null;
  oil2: number | null;
  alarmCode: string | null;
  coveragePct: number | null;
  compressorCount: number | null;
  operatingHours: number | null;
  stoppedHours: number | null;
  alarmHours: number | null;
  starts: number | null;
  note?: string | null;
}

export interface ExpoPump {
  id: string;
  label: string;
  state: 'ON' | 'OFF' | 'NO_DATA';
  remote: boolean | null;
  alarm: boolean | null;
  operatingHours: number | null;
  stoppedHours: number | null;
  localHours: number | null;
  remoteHours: number | null;
  alarmHours: number | null;
  starts: number | null;
}

export interface ExpoPumpGroup {
  id: ExpoCagGroupId;
  label: string;
  pressure: number | null;
  pressureSetpoint: number | null;
  bypassPct: number | null;
  coveragePct: number | null;
  localHoursTotal: number | null;
  alarmHoursTotal: number | null;
  startsTotal: number | null;
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

export interface ExpoChillerOperationSummary {
  id: ExpoCagGroupId;
  label: string;
  operatingHours: number | null;
  stoppedHours: number | null;
  alarmHours: number | null;
  starts: number | null;
  coveragePct: number | null;
}

export interface ExpoChillerCapacitySummary {
  id: ExpoCagGroupId;
  label: string;
  total: number | null;
  circuitA: number | null;
  circuitB: number | null;
}

export interface ExpoChillerWaterTrendPoint {
  label: string;
  timestamp: string | null;
  inlet: number | null;
  outlet: number | null;
  setpoint: number | null;
  deltaT: number | null;
}

export interface ExpoChillerCapacityTrendPoint {
  label: string;
  timestamp: string | null;
  total: number | null;
  circuitA: number | null;
  circuitB: number | null;
}

export interface ExpoChillerPressureTrendPoint {
  label: string;
  timestamp: string | null;
  suctionA: number | null;
  dischargeA: number | null;
  suctionB: number | null;
  dischargeB: number | null;
}

export interface ExpoPumpPressureTrendPoint {
  label: string;
  timestamp: string | null;
  pressure: number | null;
  setpoint: number | null;
}

export interface ExpoPumpBypassTrendPoint {
  label: string;
  timestamp: string | null;
  bypass: number | null;
}

export interface ExpoPumpActivityTrendPoint {
  label: string;
  timestamp: string | null;
  bag1: number | null;
  bag2: number | null;
  bag3: number | null;
  bag4: number | null;
}

export interface ExpoAnalyticsSeriesGroup<T> {
  id: ExpoCagGroupId;
  label: string;
  series: T[];
}

export interface ExpoCagAnalytics {
  chillerOperation: ExpoChillerOperationSummary[];
  chillerCapacity: ExpoChillerCapacitySummary[];
  water: ExpoAnalyticsSeriesGroup<ExpoChillerWaterTrendPoint>[];
  capacity: ExpoAnalyticsSeriesGroup<ExpoChillerCapacityTrendPoint>[];
  pressures: ExpoAnalyticsSeriesGroup<ExpoChillerPressureTrendPoint>[];
  pumps: Array<{
    id: ExpoCagGroupId;
    label: string;
    pressureSeries: ExpoPumpPressureTrendPoint[];
    bypassSeries: ExpoPumpBypassTrendPoint[];
    activitySeries: ExpoPumpActivityTrendPoint[];
  }>;
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

export interface ExpoWaterPavillionSummary {
  id: string;
  label: string;
  totalM3: number | null;
  potableM3: number | null;
  reuseM3: number | null;
  validMeters: number;
  attentionMeters: number;
}

export interface ExpoWaterAnalytics {
  pavillions: ExpoWaterPavillionSummary[];
  topMeters: Array<{
    id: string;
    label: string;
    pavillion: string;
    type: 'POTAVEL' | 'REUSO';
    consumptionM3: number | null;
  }>;
  mix: Array<{ id: 'potable' | 'reuse'; label: string; valueM3: number | null }>;
  timeWindows: Array<{ id: 'night' | '1018' | 'other'; label: string; valueM3: number | null }>;
}

export interface ExpoQualityAnalytics {
  statusBreakdown: Array<{
    status: 'OK' | 'DEGRADED' | 'NO_DATA' | 'COMM_ERROR';
    label: string;
    count: number;
  }>;
  cagAvailabilityHistory: Array<{
    date: string;
    label: string;
    availableSources: number;
    expectedSources: number;
    availabilityPct: number | null;
  }>;
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
    analytics: ExpoCagAnalytics;
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
    analytics: ExpoWaterAnalytics;
  };
  quality: {
    overallCoveragePct: number | null;
    sources: ExpoSourceQuality[];
    analytics: ExpoQualityAnalytics;
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
