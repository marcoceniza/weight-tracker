import { LinearGradient } from 'expo-linear-gradient';
import { Check, Pencil, Target, Trash2 } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProfile, WeightUnit } from '../types';
import { convertWeight, toKilograms } from '../utils/calculations';

cssInterop(Check, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Pencil, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Target, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Trash2, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onReset: () => Promise<void>;
}

export function SettingsView({
  profile,
  onUpdateProfile,
  onReset
}: SettingsViewProps) {
  const [name, setName] = useState(profile.name?.trim() || 'User');
  const [targetWeight, setTargetWeight] = useState(
    profile.targetWeight > 0 ? convertWeight(profile.targetWeight, profile.unit).toFixed(2) : ''
  );
  const [startWeight, setStartWeight] = useState(
    profile.startWeight > 0 ? convertWeight(profile.startWeight, profile.unit).toFixed(2) : ''
  );
  const [heightCm, setHeightCm] = useState(profile.heightCm || 170);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  const handleUnitToggle = (newUnit: WeightUnit) => {
    if (newUnit === profile.unit) return;
    const newTarget = profile.targetWeight > 0
      ? convertWeight(profile.targetWeight, newUnit).toFixed(2)
      : '';
    const newStart = profile.startWeight > 0
      ? convertWeight(profile.startWeight, newUnit).toFixed(2)
      : '';
    setTargetWeight(newTarget);
    setStartWeight(newStart);

    onUpdateProfile({
      ...profile,
      unit: newUnit
    });
  };

  const handleSave = () => {
    const targetValue = Number.parseFloat(targetWeight) || 0;
    const startValue = Number.parseFloat(startWeight) || 0;
    const targetKg = targetValue > 0 ? toKilograms(targetValue, profile.unit) : 0;
    const startKg = startValue > 0 ? toKilograms(startValue, profile.unit) : 0;
    const cleanName = name.trim() || 'User';

    onUpdateProfile({
      ...profile,
      name: cleanName,
      targetWeight: targetKg,
      startWeight: startKg,
      heightCm
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleNameDone = () => {
    const cleanName = name.trim() || 'User';
    setName(cleanName);
    nameInputRef.current?.blur();
    setIsEditingName(false);
    onUpdateProfile({ ...profile, name: cleanName });
  };

  const initialLetter = (name.trim() || 'User').charAt(0).toUpperCase();

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your weigh-ins, profile, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await onReset();
            } catch (err) {
              console.error('Reset failed:', err);
              Alert.alert(
                'Reset failed',
                'Your data could not be cleared. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  return (
    <View className="gap-4 pb-6">
      {/* Profile Header & Name Card */}
      <View className="bg-white rounded-3xl p-5 border border-[#ECE8F5]  flex-row items-center gap-2">
        <View className="w-14 h-14 rounded-2xl overflow-hidden flex-row items-center justify-center shadow-[0_6px_16px_-2px_rgba(76,53,222,0.3)] flex-shrink-0">
          <LinearGradient
            colors={['#4C35DE', '#9B86EC']}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          <Text className="text-white font-bold text-[22px]">{initialLetter}</Text>
        </View>
        <View className="flex-1">
          {isEditingName ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                ref={nameInputRef}
                placeholder="User"
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={handleNameDone}
                className="flex-1 text-[22px] font-bold text-[#161329] bg-transparent focus:outline-none"
                accessibilityLabel="Edit your name"
              />
              <Pressable
                onPress={handleNameDone}
                accessibilityRole="button"
                accessibilityLabel="Done editing name"
                className="px-2 py-1"
              >
                <Text className="text-[14px] font-semibold text-[#4C35DE]">Done</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-[22px] font-bold text-[#161329]">{name}</Text>
              <Pressable
                onPress={() => setIsEditingName(true)}
                accessibilityRole="button"
                accessibilityLabel="Edit your name"
                className="p-2"
              >
                <Pencil size={18} color="#645F78" />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Target & Body Parameters */}
      <View className="bg-white rounded-3xl p-5 border border-[#ECE8F5]  gap-4">
        <View className="flex-row items-center gap-2">
          <Target className="w-4 h-4 text-[#4C35DE]" />
          <Text className="text-[18px] font-bold text-[#161329]">
            Goals & Parameters
          </Text>
        </View>

        {/* Units Switcher */}
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-[15px] font-semibold text-[#161329]">
            Weight Unit
          </Text>
          <View className="bg-[#ECE8F5] p-1 rounded-full flex-row items-center">
            <TouchableOpacity
              onPress={() => handleUnitToggle('kg')}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: profile.unit === 'kg' }}
              style={[
                {
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 999,
                },
                profile.unit === 'kg' && {
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#4C35DE',
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 1
                }
              ]}
            >
              <Text className={`text-[14px] font-semibold ${profile.unit === 'kg' ? 'text-[#161329]' : 'text-[#645F78]'}`}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleUnitToggle('lbs')}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: profile.unit === 'lbs' }}
              style={[
                {
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 999
                },
                profile.unit === 'lbs' && {
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#4C35DE',
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 1
                }
              ]}
            >
              <Text className={`text-[14px] font-semibold ${profile.unit === 'lbs' ? 'text-[#161329]' : 'text-[#645F78]'}`}>lbs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#F7F6FA] p-3 rounded-2xl border border-[#ECE8F5]">
            <Text className="text-[13px] font-bold text-[#645F78] uppercase block mb-1">
              Target ({profile.unit})
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={targetWeight}
              onChangeText={setTargetWeight}
              className="w-full text-[28px] font-bold text-[#161329] bg-transparent focus:outline-none tnum placeholder:text-gray-300"
            />
          </View>

          <View className="flex-1 bg-[#F7F6FA] p-3 rounded-2xl border border-[#ECE8F5]">
            <Text className="text-[13px] font-bold text-[#645F78] uppercase block mb-1">
              Start ({profile.unit})
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={startWeight}
              onChangeText={setStartWeight}
              className="w-full text-[28px] font-bold text-[#161329] bg-transparent focus:outline-none tnum placeholder:text-gray-300"
            />
          </View>
        </View>

        <View className="bg-[#F7F6FA] p-3 rounded-2xl border border-[#ECE8F5]">
          <Text className="text-[13px] font-bold text-[#645F78] uppercase block mb-1">
            Height (cm) — For BMI
          </Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="170"
            value={String(heightCm || '')}
            onChangeText={text => setHeightCm(parseInt(text, 10) || 0)}
            className="w-full text-[28px] font-bold text-[#161329] bg-transparent focus:outline-none tnum placeholder:text-gray-300"
          />
        </View>

        <Pressable
         
          onPress={handleSave}
          className="w-full h-14 rounded-full bg-[#4C35DE] text-white text-[16px] font-semibold  flex-row items-center justify-center gap-1.5"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <Text className="text-[16px] font-semibold text-white">Settings Saved!</Text>
            </>
          ) : (
            <Text className="text-[16px] font-semibold text-white">Save Settings</Text>
          )}
        </Pressable>
      </View>

      {/* Danger Zone */}
      <View className="bg-white rounded-3xl p-5 border border-rose-100  gap-3">
        <View className="flex-row items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-500" />
          <Text className="text-[18px] font-bold text-[#161329]">
            Danger Zone
          </Text>
        </View>
        <Text className="text-[13px] text-[#645F78] leading-5">
          Permanently delete all weigh-ins, profile data, and settings. This cannot be undone.
        </Text>
        <Pressable
          onPress={handleReset}
          accessibilityRole="button"
          className="w-full h-12 rounded-full bg-rose-50 border border-rose-200 flex-row items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
          <Text className="text-[15px] font-semibold text-rose-600">
            Reset All Data
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
