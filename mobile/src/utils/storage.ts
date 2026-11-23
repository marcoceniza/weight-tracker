import {
  deleteSQLiteEntry,
  getSQLiteEntries,
  getSQLiteProfile,
  initSQLite,
  resetAllData as resetSQLiteData,
  saveSQLiteEntry,
  saveSQLiteProfile
} from '../db/database';
import { UserProfile, WeightEntry } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'user_profile',
  ENTRIES: 'weight_entries',
} as const;

/**
 * Cross-platform key/value store backing the legacy localStorage API.
 *
 * Web:    window.localStorage (persisted, synchronous)
 * Native: no localStorage — falls back to an in-memory cache so reads and
 *         writes never throw. The app's real persistence is SQLite.
 */
export class Storage {
  private cache = new Map<string, string>();

  getItem(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return this.cache.get(key) ?? null;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      } else {
        this.cache.set(key, value);
      }
    } catch {
      // ignore — native devices have no localStorage to persist to
    }
  }
}

export const storage = new Storage();

export const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  startWeight: 0,
  currentWeight: 0,
  targetWeight: 0,
  heightCm: 170,
  unit: 'kg',
  heightUnit: 'cm',
  startDate: new Date().toISOString().split('T')[0],
  targetDate: '',
  weeklyTargetRate: -0.4,
  soundEnabled: true,
  hapticsEnabled: true,
  setupComplete: false,
};

export function loadProfile(): UserProfile {
  const raw = storage.getItem(STORAGE_KEYS.PROFILE);
  if (raw) {
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      // ignore malformed profile
    }
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  storage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadEntries(): WeightEntry[] {
  const raw = storage.getItem(STORAGE_KEYS.ENTRIES);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return deduplicateEntriesById(parsed);
      }
    } catch {
      // ignore malformed entries
    }
  }
  return [];
}

export function deduplicateEntriesById(entries: WeightEntry[]): WeightEntry[] {
  return [...new Map(entries.map(entry => [entry.id, entry])).values()];
}

export function saveEntries(entries: WeightEntry[]): void {
  storage.setItem(
    STORAGE_KEYS.ENTRIES,
    JSON.stringify(deduplicateEntriesById(entries))
  );
}

/**
 * Initialize Expo SQLite and synchronize state (starting clean with no initial mock data)
 */
export async function syncWithSQLite(
  onLoaded: (entries: WeightEntry[], profile: UserProfile) => void
): Promise<void> {
  try {
    await initSQLite();

    let sqliteEntries = await getSQLiteEntries();
    let sqliteProfile = await getSQLiteProfile();

    if (sqliteEntries.length === 0) {
      sqliteEntries = loadEntries();
      for (const entry of sqliteEntries) {
        await saveSQLiteEntry(entry);
      }
    }

    if (!sqliteProfile) {
      sqliteProfile = loadProfile();
      await saveSQLiteProfile(sqliteProfile);
    }

    sqliteProfile = {
      ...sqliteProfile,
      setupComplete: sqliteProfile.setupComplete ||
        sqliteEntries.length > 0 ||
        sqliteProfile.name.trim() !== DEFAULT_PROFILE.name ||
        sqliteProfile.currentWeight > 0 ||
        sqliteProfile.startWeight > 0
    };
    await saveSQLiteProfile(sqliteProfile);

    if (sqliteProfile) {
      saveProfile(sqliteProfile);
    }

    if (sqliteEntries && sqliteEntries.length > 0) {
      saveEntries(sqliteEntries);
      onLoaded(sqliteEntries, sqliteProfile || loadProfile());
    } else {
      // Empty fresh state
      saveEntries([]);
      onLoaded([], sqliteProfile || loadProfile());
    }
  } catch (err) {
    console.warn('[Storage] SQLite sync error:', err);
    throw err;
  }
}

/**
 * Wipe all persisted data (SQLite + legacy storage) and return the app to
 * its first-launch state. Used by the Settings "Reset all data" action.
 */
export async function resetAllData(): Promise<void> {
  await resetSQLiteData();
  saveProfile(DEFAULT_PROFILE);
  saveEntries([]);
}

export {
  deleteSQLiteEntry, saveSQLiteEntry, saveSQLiteProfile
};
