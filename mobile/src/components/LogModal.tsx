import confetti from 'canvas-confetti';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { UserProfile, WeightEntry } from '../types';
import { convertWeight, toKilograms } from '../utils/calculations';
import { formatDateForStorage } from '../utils/date';
import { sound } from '../utils/sound';
import { DatePickerField } from './DatePickerField';
import { RulerPicker } from './RulerPicker';

cssInterop(X, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });


interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: WeightEntry) => void;
  profile: UserProfile;
  latestEntry?: WeightEntry;
}

export function LogModal({
  isOpen,
  ...props
}: LogModalProps) {
  if (!isOpen) return null;

  return <LogModalForm {...props} />;
}

type LogModalFormProps = Omit<LogModalProps, 'isOpen'>;

function LogModalForm({
  onClose,
  onSaveEntry,
  profile,
  latestEntry
}: LogModalFormProps) {
  const now = new Date();
  const todayStr = formatDateForStorage(now);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const currentUnit = profile.unit;
  const initialKg = latestEntry
    ? latestEntry.weight
    : profile.currentWeight > 0
    ? profile.currentWeight
    : profile.startWeight > 0
    ? profile.startWeight
    : 68.0;
  const initialValueInUnit = convertWeight(initialKg, currentUnit);

  const [weightValue, setWeightValue] = useState<number>(initialValueInUnit);
  const [date, setDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>('');

  const handleSave = () => {
    sound.playSuccess();
    sound.triggerVibrate([20, 40, 20]);

    const weightKg = toKilograms(weightValue, currentUnit);
    const timeOfDay = now.getHours() < 14 ? 'morning' : 'evening';

    const newEntry: WeightEntry = {
      id: `entry_${Date.now()}`,
      date,
      time: timeStr,
      weight: weightKg,
      timeOfDay,
      notes: notes.trim() ? notes.trim() : undefined,
      habits: {
        fasted: timeOfDay === 'morning',
        morning: timeOfDay === 'morning',
        hydrated: true,
        active: false,
        goodSleep: true
      },
      tags: [timeOfDay === 'morning' ? 'Morning fasted' : 'Evening']
    };

    if (Platform.OS === 'web' && profile.targetWeight > 0 && weightKg <= profile.targetWeight) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    onSaveEntry(newEntry);
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 items-center justify-center p-4 bg-[#161329]/45">
          <View className="w-full max-w-[350px] max-h-[90%] bg-white rounded-3xl border border-[#ECE8F5] shadow-2xl shadow-indigo-950/20 overflow-hidden flex flex-col">
        {/* Compact Header */}
        <View
          className="p-4 pb-2 border-b border-[#ECE8F5]/80 flex-row items-center justify-between bg-white"
          style={{ flexShrink: 0 }}
        >
          <Text className="text-[19px] font-bold text-[#161329]">
            Log Weigh-In
          </Text>

          <Pressable
            onPress={onClose}
            className="w-7 h-7 rounded-full bg-[#ECE8F5] flex-row items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </Pressable>
        </View>

        {/* Modal Body */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flexShrink: 1 }}
          contentContainerStyle={{ padding: 16, gap: 14 }}
        >
          {/* Ruler Picker */}
          <View>
            <RulerPicker
              value={weightValue}
              unit={currentUnit}
              onChange={setWeightValue}
              lastRecordedValue={latestEntry ? convertWeight(latestEntry.weight, currentUnit) : undefined}
            />
          </View>

          {/* Date Picker */}
          <DatePickerField value={date} onChange={setDate} />

          {/* Optional Note */}
          <View>
            <TextInput
              placeholder="Note (optional)..."
              value={notes}
              onChangeText={setNotes}
              className="w-full bg-[#F7F6FA] border border-[#ECE8F5] rounded-xl px-3 py-4 text-[12px] text-[#161329] focus:outline-none focus:border-[#4C35DE] placeholder:text-[#A29DB5]"
            />
          </View>
        </ScrollView>

        {/* Footer with "Cancel" and "Save" only */}
        <View
          className="p-3 border-t border-[#ECE8F5]/80 bg-white flex-row items-center gap-2.5"
          style={{ flexShrink: 0 }}
        >
          <Pressable
            onPress={onClose}
            className="flex-1 h-12 rounded-full bg-[#ECE8F5] flex-row items-center justify-center"
          >
            <Text className="text-[12px] font-semibold text-[#645F78]">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            className="flex-1 h-12 rounded-full overflow-hidden bg-[#4C35DE] text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(76,53,222,0.35)] hover:shadow-[0_6px_16px_rgba(76,53,222,0.45)] active:scale-95 items-center justify-center"
          >
            <LinearGradient
              colors={['#4C35DE', '#6E54F7']}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <Text className="text-[12px] font-semibold text-white">Save</Text>
          </Pressable>
        </View>
      </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
