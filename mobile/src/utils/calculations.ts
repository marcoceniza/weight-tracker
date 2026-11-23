import { WeightEntry, WeightUnit } from '../types';
import { dateToDayNumber, shiftCalendarDate } from './date';

export const KG_TO_LBS = 2.20462262;

export function convertWeight(weightKg: number, toUnit: WeightUnit): number {
  if (toUnit === 'lbs') {
    return Math.round(weightKg * KG_TO_LBS * 100) / 100;
  }
  return Math.round(weightKg * 100) / 100;
}

export function toKilograms(weight: number, fromUnit: WeightUnit): number {
  if (fromUnit === 'lbs') {
    return weight / KG_TO_LBS;
  }
  return weight;
}

export function formatWeight(weightKg: number, unit: WeightUnit, showUnit: boolean = true): string {
  const val = convertWeight(weightKg, unit).toFixed(2);
  return showUnit ? `${val} ${unit}` : val;
}

export function formatDelta(deltaKg: number, unit: WeightUnit): { text: string; isNegative: boolean; isNeutral: boolean } {
  const converted = (unit === 'lbs' ? deltaKg * KG_TO_LBS : deltaKg);
  const rounded = Math.round(converted * 100) / 100;
  
  if (rounded === 0) {
    return { text: `0.00 ${unit}`, isNegative: false, isNeutral: true };
  }
  const sign = rounded > 0 ? '+' : '';
  return {
    text: `${sign}${rounded.toFixed(2)} ${unit}`,
    isNegative: rounded < 0,
    isNeutral: false
  };
}

export function calculateBMI(weightKg: number, heightCm: number): { value: number; label: string; color: string } {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) {
    return { value: 0, label: 'N/A', color: '#645F78' };
  }
  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);
  const rounded = Math.round(bmi * 100) / 100;

  if (bmi < 18.5) {
    return { value: rounded, label: 'Underweight', color: '#634eb0' };
  } else if (bmi < 25) {
    return { value: rounded, label: 'Normal range', color: '#10b981' };
  } else if (bmi < 30) {
    return { value: rounded, label: 'Overweight', color: '#f59e0b' };
  } else {
    return { value: rounded, label: 'Obese', color: '#ef4444' };
  }
}

export function calculateMovingAverage(entries: WeightEntry[], windowSize = 7): { date: string; weight: number }[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const dayNumbers = sorted.map(entry => dateToDayNumber(entry.date));
  const calendarDays = Math.max(1, Math.floor(windowSize));
  const result: { date: string; weight: number }[] = [];
  let startIdx = 0;

  for (let i = 0; i < sorted.length; i++) {
    while (startIdx < i && dayNumbers[i] - dayNumbers[startIdx] >= calendarDays) {
      startIdx++;
    }
    const slice = sorted.slice(startIdx, i + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.weight, 0);
    const avg = sum / slice.length;
    result.push({
      date: sorted[i].date,
      weight: avg
    });
  }

  return result;
}

export function calculateTrendStats(entries: WeightEntry[], startWeight: number, targetWeight: number) {
  if (entries.length === 0) {
    return {
      current: startWeight,
      totalLost: 0,
      remaining: targetWeight > 0 ? Math.abs(startWeight - targetWeight) : 0,
      progressPercent: 0,
      weeklyRate: 0,
      last7DaysDelta: 0,
      last30DaysDelta: 0,
      projectedDate: null as string | null
    };
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const current = latest.weight;
  const latestDay = dateToDayNumber(latest.date);
  const firstDay = dateToDayNumber(sorted[0].date);

  const totalDelta = current - startWeight;
  const targetDistance = targetWeight - startWeight;
  const hasTargetWeight = Number.isFinite(targetWeight) && targetWeight > 0;
  
  let progressPercent = 0;
  if (hasTargetWeight && startWeight > 0 && targetDistance !== 0) {
    const reachedTarget = targetDistance < 0 ? current <= targetWeight : current >= targetWeight;
    const roundedProgress = Math.round(((startWeight - current) / (startWeight - targetWeight)) * 100);
    progressPercent = Math.min(reachedTarget ? 100 : 99, Math.max(0, roundedProgress));
  } else if (hasTargetWeight && current === targetWeight) {
    progressPercent = 100;
  }

  const remaining = hasTargetWeight ? Math.abs(current - targetWeight) : 0;

  const getWindowDelta = (days: number) => {
    const cutoffDay = latestDay - days;
    const priorEntry = [...sorted].reverse().find(entry => dateToDayNumber(entry.date) < cutoffDay);
    const firstEntryInWindow = sorted.find(entry => dateToDayNumber(entry.date) >= cutoffDay);
    const baseline = priorEntry ?? firstEntryInWindow;
    return baseline ? current - baseline.weight : 0;
  };

  const last7DaysDelta = getWindowDelta(7);
  const last30DaysDelta = getWindowDelta(30);

  const elapsedDays = latestDay - firstDay;
  const observedDelta = current - sorted[0].weight;
  const weeklyRate = elapsedDays > 0 ? (observedDelta / elapsedDays) * 7 : 0;

  // Projected goal date
  let projectedDate: string | null = null;
  if (hasTargetWeight && remaining > 0 && Math.abs(weeklyRate) > 0.05) {
    const isLosing = targetWeight < startWeight;
    const isRateHelping = isLosing ? weeklyRate < 0 : weeklyRate > 0;

    if (isRateHelping) {
      const projectedDays = (remaining / Math.abs(weeklyRate)) * 7;
      const daysRemaining = Math.ceil(projectedDays - 1e-9);
      const projectedDay = shiftCalendarDate(latest.date, daysRemaining);
      projectedDate = new Date(`${projectedDay}T12:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
  }

  return {
    current,
    totalLost: totalDelta,
    remaining,
    progressPercent,
    weeklyRate,
    last7DaysDelta,
    last30DaysDelta,
    projectedDate
  };
}

/**
 * Generate smooth Bezier SVG path through point coordinates
 */
export function buildBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];

    // Catmull-Rom to Cubic Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}
