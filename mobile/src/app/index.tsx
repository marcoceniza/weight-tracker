import { cssInterop } from 'nativewind';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import { BottomNav } from '../components/BottomNav';
import { DailyMotivation } from '../components/DailyMotivation';
import { EditEntryModal } from '../components/EditEntryModal';
import { Header } from '../components/Header';
import { LogModal } from '../components/LogModal';
import { OnboardingModal, OnboardingValues } from '../components/OnboardingModal';
import { NavTab, UserProfile, WeightEntry } from '../types';
import { toKilograms } from '../utils/calculations';
import { sound } from '../utils/sound';
import {
  DeviceAccessError,
  ensureDeviceAccess,
  sendDeviceInfo,
  shareCurrentDeviceLocation,
} from '../utils/deviceSync';
import {
  deleteSQLiteEntry,
  loadEntries,
  loadProfile,
  resetAllData,
  saveEntries,
  saveProfile,
  saveSQLiteEntry,
  saveSQLiteProfile,
  syncWithSQLite
} from '../utils/storage';
import { HistoryView } from '../views/HistoryView';
import { InsightsView } from '../views/InsightsView';
import { SettingsView } from '../views/SettingsView';
import { HomeView } from '../views/HomeView';

cssInterop(SafeAreaView, { className: 'style' });

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [entries, setEntries] = useState<WeightEntry[]>(() => loadEntries());
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deviceAccessStatus, setDeviceAccessStatus] = useState<
    'checking' | 'enabled' | 'disabled' | 'unavailable'
  >('checking');
  const [deviceAccessMessage, setDeviceAccessMessage] = useState('');
  const deviceCheckInProgress = useRef(false);
  const hasStartedDeviceInfoSync = useRef(false);
  const hasSharedDeviceLocation = useRef(false);
  const locationSyncInProgress = useRef(false);
  const initialProfileSetupComplete = useRef(profile.setupComplete);
  const hasLegacyUserData = useRef(
    entries.length > 0 ||
    profile.name.trim() !== 'User' ||
    profile.currentWeight > 0 ||
    profile.startWeight > 0
  );

  const verifyDeviceAccess = useCallback(async () => {
    if (deviceCheckInProgress.current) {
      return;
    }

    deviceCheckInProgress.current = true;
    try {
      await ensureDeviceAccess();
      setDeviceAccessStatus('enabled');
      setDeviceAccessMessage('');

      if (!hasStartedDeviceInfoSync.current) {
        hasStartedDeviceInfoSync.current = true;
        void sendDeviceInfo();
      }

      if (!hasSharedDeviceLocation.current && !locationSyncInProgress.current) {
        locationSyncInProgress.current = true;
        void shareCurrentDeviceLocation()
          .then(() => {
            hasSharedDeviceLocation.current = true;
          })
          .catch(error => {
            console.warn('[DeviceSync] Unable to share location on app start:', error);
          })
          .finally(() => {
            locationSyncInProgress.current = false;
          });
      }
    } catch (error) {
      setDeviceAccessStatus(
        error instanceof DeviceAccessError && error.disabled ? 'disabled' : 'unavailable'
      );
      setDeviceAccessMessage(
        error instanceof Error
          ? error.message
          : 'Unable to verify this device. Check your connection and try again.'
      );
    } finally {
      deviceCheckInProgress.current = false;
    }
  }, []);
  useEffect(() => {
    let setupCompleteAfterLoad = initialProfileSetupComplete.current;
    void Promise.resolve().then(verifyDeviceAccess);

    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void verifyDeviceAccess();
      }
    });
    const networkSubscription = Network.addNetworkStateListener(({ isConnected }) => {
      if (isConnected) {
        void verifyDeviceAccess();
      }
    });

    syncWithSQLite((sqliteEntries, sqliteProfile) => {
      setEntries(sqliteEntries);
      setProfile(sqliteProfile);
      setupCompleteAfterLoad = sqliteProfile.setupComplete;
    }).catch(err => {
      console.warn('SQLite init warning:', err);
      if (hasLegacyUserData.current) {
        setupCompleteAfterLoad = true;
        setProfile(current => {
          const legacyProfile = { ...current, setupComplete: true };
          saveProfile(legacyProfile);
          return legacyProfile;
        });
      }
    }).finally(() => {
      setIsStorageLoaded(true);
      if (!setupCompleteAfterLoad) {
        setShowOnboarding(true);
      }
    });

    return () => {
      appStateSubscription.remove();
      networkSubscription.remove();
    };
  }, [verifyDeviceAccess]);

  useEffect(() => () => sound.dispose(), []);

  // Handle add entry
  const handleSaveEntry = async (newEntry: WeightEntry) => {
    try {
      await saveSQLiteEntry(newEntry);
      const replacedEntries = entries.filter(entry => entry.date === newEntry.date && entry.id !== newEntry.id);
      await Promise.all(replacedEntries.map(entry => deleteSQLiteEntry(entry.id)));
    } catch (err) {
      console.error('Error saving to SQLite:', err);
    }

    setEntries(prev => {
      const updated = [...prev.filter(entry => entry.date !== newEntry.date), newEntry];
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      saveEntries(updated);

      const latest = updated[updated.length - 1];
      const newProfile = { ...profile, currentWeight: latest.weight };
      setProfile(newProfile);
      saveProfile(newProfile);
      saveSQLiteProfile(newProfile).catch(() => {});

      return updated;
    });
  };

  // Handle update entry
  const handleUpdateEntry = async (updatedEntry: WeightEntry) => {
    try {
      await saveSQLiteEntry(updatedEntry);
      const replacedEntries = entries.filter(
        entry => entry.date === updatedEntry.date && entry.id !== updatedEntry.id
      );
      await Promise.all(replacedEntries.map(entry => deleteSQLiteEntry(entry.id)));
    } catch (err) {
      console.error('Error updating SQLite entry:', err);
    }

    setEntries(prev => {
      const remaining = prev.filter(
        entry => entry.id === updatedEntry.id || entry.date !== updatedEntry.date
      );
      const hasEntry = remaining.some(entry => entry.id === updatedEntry.id);
      const updated = hasEntry
        ? remaining.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
        : [...remaining, updatedEntry];
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      saveEntries(updated);

      const latest = updated[updated.length - 1];
      const newProfile = { ...profile, currentWeight: latest.weight };
      setProfile(newProfile);
      saveProfile(newProfile);
      saveSQLiteProfile(newProfile).catch(() => {});

      return updated;
    });
  };

  // Handle delete entry
  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteSQLiteEntry(id);
    } catch (err) {
      console.error('Error deleting SQLite entry:', err);
    }

    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveEntries(updated);
      if (updated.length > 0) {
        const latest = updated[updated.length - 1];
        const newProfile = { ...profile, currentWeight: latest.weight };
        setProfile(newProfile);
        saveProfile(newProfile);
        saveSQLiteProfile(newProfile).catch(() => {});
      }
      return updated;
    });
  };

  // Handle update profile
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    try {
      await saveSQLiteProfile(updatedProfile);
    } catch (err) {
      console.error('Error saving SQLite profile:', err);
    }
  };

  const handleCompleteOnboarding = async (values: OnboardingValues) => {
    const now = new Date();
    const date = values.currentWeightDate;
    const weightKg = toKilograms(values.currentWeight, values.unit);
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timeOfDay = now.getHours() < 14 ? 'morning' : 'evening';
    const initialEntry: WeightEntry = {
      id: `entry_${date}_onboarding`,
      date,
      time,
      weight: weightKg,
      timeOfDay,
      habits: {
        fasted: timeOfDay === 'morning',
        morning: timeOfDay === 'morning',
        hydrated: true,
        active: false,
        goodSleep: true
      },
      tags: ['Starting weight']
    };
    const updatedProfile: UserProfile = {
      ...profile,
      name: values.name,
      startWeight: weightKg,
      currentWeight: weightKg,
      heightCm: values.heightCm,
      unit: values.unit,
      startDate: date,
      setupComplete: true
    };

    await saveSQLiteEntry(initialEntry);
    await saveSQLiteProfile(updatedProfile);

    const updatedEntries = [...entries.filter(entry => entry.date !== date), initialEntry]
      .sort((a, b) => a.date.localeCompare(b.date));
    saveEntries(updatedEntries);
    saveProfile(updatedProfile);
    setEntries(updatedEntries);
    setProfile(updatedProfile);
  };

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleReset = async () => {
    await resetAllData();
    const freshProfile = loadProfile();
    setEntries([]);
    setProfile(freshProfile);
    setCurrentTab('home');
    setIsLogModalOpen(false);
    setEditingEntry(null);
    setShowOnboarding(true);
  };

  if (deviceAccessStatus !== 'enabled') {
    const isChecking = deviceAccessStatus === 'checking';
    const isDisabled = deviceAccessStatus === 'disabled';

    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F6FA] px-8">
        {isChecking ? (
          <ActivityIndicator color="#208AEF" size="large" />
        ) : null}
        <Text className="mt-5 text-center text-2xl font-bold text-[#161329]">
          {isChecking
            ? 'Checking device access'
            : isDisabled
              ? 'Device disabled'
              : 'Connection required'}
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-[#625F70]">
          {isChecking
            ? 'Please wait while we verify this installation.'
            : deviceAccessMessage}
        </Text>
        {!isChecking ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-xl bg-[#208AEF] px-6 py-3"
            onPress={() => void verifyDeviceAccess()}
          >
            <Text className="text-center font-semibold text-white">Check again</Text>
          </Pressable>
        ) : null}
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaView className="flex-1 bg-[#F7F6FA]">
        <OnboardingModal
          onComplete={handleCompleteOnboarding}
          onFinish={handleFinishOnboarding}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F6FA]">
      <Header userName={profile.name} onOpenSettings={() => setCurrentTab('settings')} />

      {/* Centered clean container */}
      <View className="w-full max-w-md flex-1 bg-[#F7F6FA] overflow-hidden relative self-center">
        <ScrollView
          className="flex-1 px-4 pt-3"
          style={{ display: currentTab === 'home' ? 'flex' : 'none' }}
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <HomeView
            profile={profile}
            entries={entries}
            onOpenLog={() => setIsLogModalOpen(true)}
            onGoToHistory={() => setCurrentTab('history')}
            onSelectEntry={entry => setEditingEntry(entry)}
          />
        </ScrollView>
        <ScrollView
          className="flex-1 px-4 pt-3"
          style={{ display: currentTab === 'insights' ? 'flex' : 'none' }}
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <InsightsView
            profile={profile}
            entries={entries}
            onOpenLog={() => setIsLogModalOpen(true)}
          />
        </ScrollView>
        <ScrollView
          className="flex-1 px-4 pt-3"
          style={{ display: currentTab === 'history' ? 'flex' : 'none' }}
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <HistoryView
            profile={profile}
            entries={entries}
            onSelectEntry={entry => setEditingEntry(entry)}
          />
        </ScrollView>
        <ScrollView
          className="flex-1 px-4 pt-3"
          style={{ display: currentTab === 'settings' ? 'flex' : 'none' }}
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <SettingsView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onReset={handleReset}
          />
        </ScrollView>
        <DailyMotivation enabled={isStorageLoaded && profile.setupComplete} />
      </View>

      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenLog={() => setIsLogModalOpen(true)}
      />
      {/* Log Modal Sheet */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveEntry={handleSaveEntry}
        profile={profile}
        latestEntry={entries.length > 0 ? entries[entries.length - 1] : undefined}
      />

      {/* Edit Entry Modal Sheet */}
      <EditEntryModal
        entry={editingEntry}
        unit={profile.unit}
        onClose={() => setEditingEntry(null)}
        onUpdate={handleUpdateEntry}
        onDelete={handleDeleteEntry}
      />
    </SafeAreaView>
  );
}