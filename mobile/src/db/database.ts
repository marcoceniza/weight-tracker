import * as SQLite from 'expo-sqlite';
import { UserProfile, WeightEntry } from '../types';

// Standard Expo SQLite SDK 57 instantiation
export const db: SQLite.SQLiteDatabase = SQLite.openDatabaseSync('weight_tracker.db');

export async function initSQLite(): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS weight_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      weight REAL NOT NULL,
      body_fat_percentage REAL,
      muscle_mass_percentage REAL,
      water_percentage REAL,
      notes TEXT,
      tags TEXT,
      habits TEXT,
      time_of_day TEXT DEFAULT 'morning'
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'User',
      start_weight REAL NOT NULL DEFAULT 0,
      current_weight REAL NOT NULL DEFAULT 0,
      target_weight REAL NOT NULL DEFAULT 0,
      height_cm REAL NOT NULL DEFAULT 170,
      unit TEXT NOT NULL DEFAULT 'kg',
      height_unit TEXT NOT NULL DEFAULT 'cm',
      start_date TEXT,
      target_date TEXT,
      weekly_target_rate REAL NOT NULL DEFAULT -0.4,
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      haptics_enabled INTEGER NOT NULL DEFAULT 1,
      setup_complete INTEGER NOT NULL DEFAULT 0
    );
  `);

  const profileColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(user_profile);');
  if (!profileColumns.some(column => column.name === 'setup_complete')) {
    await db.execAsync('ALTER TABLE user_profile ADD COLUMN setup_complete INTEGER NOT NULL DEFAULT 0;');
  }
}

/**
 * Fetch all entries from SQLite database
 */
export async function getSQLiteEntries(): Promise<WeightEntry[]> {
  await initSQLite();
  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    time: string;
    weight: number;
    body_fat_percentage: number | null;
    muscle_mass_percentage: number | null;
    water_percentage: number | null;
    notes: string | null;
    tags: string | null;
    habits: string | null;
    time_of_day: string | null;
  }>('SELECT * FROM weight_entries ORDER BY date ASC, time ASC;');

  return rows.map(r => {
    let parsedTags: string[] = [];
    try {
      if (r.tags) parsedTags = JSON.parse(r.tags);
    } catch {
      parsedTags = [];
    }

    let parsedHabits = {
      fasted: true,
      morning: true,
      hydrated: true,
      active: false,
      goodSleep: true
    };
    try {
      if (r.habits) parsedHabits = JSON.parse(r.habits);
    } catch {
      // fallback
    }

    return {
      id: r.id,
      date: r.date,
      time: r.time,
      weight: Number(r.weight),
      bodyFatPercentage: r.body_fat_percentage != null ? Number(r.body_fat_percentage) : undefined,
      muscleMassPercentage: r.muscle_mass_percentage != null ? Number(r.muscle_mass_percentage) : undefined,
      waterPercentage: r.water_percentage != null ? Number(r.water_percentage) : undefined,
      notes: r.notes || undefined,
      tags: parsedTags,
      habits: parsedHabits,
      timeOfDay: (r.time_of_day as 'morning' | 'evening') || 'morning'
    };
  });
}

/**
 * Insert or replace entry in SQLite
 */
export async function saveSQLiteEntry(entry: WeightEntry): Promise<void> {
  await initSQLite();
  await db.runAsync(
    `INSERT OR REPLACE INTO weight_entries (
      id, date, time, weight, body_fat_percentage, muscle_mass_percentage, water_percentage, notes, tags, habits, time_of_day
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    entry.id,
    entry.date,
    entry.time,
    entry.weight,
    entry.bodyFatPercentage ?? null,
    entry.muscleMassPercentage ?? null,
    entry.waterPercentage ?? null,
    entry.notes ?? null,
    entry.tags ? JSON.stringify(entry.tags) : null,
    entry.habits ? JSON.stringify(entry.habits) : null,
    entry.timeOfDay || 'morning'
  );
}

/**
 * Delete entry from SQLite
 */
export async function deleteSQLiteEntry(id: string): Promise<void> {
  await initSQLite();
  await db.runAsync('DELETE FROM weight_entries WHERE id = ?;', id);
}

/**
 * Fetch user profile from SQLite
 */
export async function getSQLiteProfile(): Promise<UserProfile | null> {
  await initSQLite();
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    start_weight: number;
    current_weight: number;
    target_weight: number;
    height_cm: number;
    unit: string;
    height_unit: string;
    start_date: string | null;
    target_date: string | null;
    weekly_target_rate: number;
    sound_enabled: number;
    haptics_enabled: number;
    setup_complete: number;
  }>('SELECT * FROM user_profile WHERE id = ?;', 'current_user');

  if (!row) return null;

  return {
    name: row.name || 'User',
    startWeight: Number(row.start_weight),
    currentWeight: Number(row.current_weight),
    targetWeight: Number(row.target_weight),
    heightCm: Number(row.height_cm) || 170,
    unit: (row.unit as 'kg' | 'lbs') || 'kg',
    heightUnit: (row.height_unit as 'cm' | 'ft_in') || 'cm',
    startDate: row.start_date || new Date().toISOString().split('T')[0],
    targetDate: row.target_date || '',
    weeklyTargetRate: Number(row.weekly_target_rate) || -0.4,
    soundEnabled: Boolean(row.sound_enabled),
    hapticsEnabled: Boolean(row.haptics_enabled),
    setupComplete: Boolean(row.setup_complete)
  };
}

/**
 * Delete all data from both tables (full reset)
 */
export async function resetAllData(): Promise<void> {
  await initSQLite();
  await db.execAsync('DELETE FROM weight_entries;');
  await db.execAsync('DELETE FROM user_profile;');
}

/**
 * Save user profile in SQLite
 */
export async function saveSQLiteProfile(profile: UserProfile): Promise<void> {
  await initSQLite();
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile (
      id, name, start_weight, current_weight, target_weight, height_cm, unit, height_unit, start_date, target_date, weekly_target_rate, sound_enabled, haptics_enabled, setup_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    'current_user',
    profile.name || 'User',
    profile.startWeight || 0,
    profile.currentWeight || 0,
    profile.targetWeight || 0,
    profile.heightCm || 170,
    profile.unit || 'kg',
    profile.heightUnit || 'cm',
    profile.startDate || '',
    profile.targetDate || '',
    profile.weeklyTargetRate || -0.4,
    profile.soundEnabled ? 1 : 0,
    profile.hapticsEnabled ? 1 : 0,
    profile.setupComplete ? 1 : 0
  );
}
