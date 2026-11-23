export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft_in';

export interface Habits {
  fasted: boolean;
  morning: boolean;
  hydrated: boolean;
  active: boolean;
  goodSleep: boolean;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  weight: number; // Stored in kilograms as canonical
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  waterPercentage?: number;
  notes?: string;
  tags?: string[];
  habits: Habits;
  photoUrl?: string;
  timeOfDay: 'morning' | 'evening';
}

export interface UserProfile {
  name: string;
  startWeight: number; // kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  heightCm: number;
  unit: WeightUnit;
  heightUnit: HeightUnit;
  startDate: string;
  targetDate: string;
  weeklyTargetRate: number; // kg per week, e.g. -0.5
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setupComplete: boolean;
}

export type Timeframe = '1W' | '1M' | '3M' | '1Y' | 'ALL';

export type NavTab = 'home' | 'insights' | 'history' | 'settings';
