import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, X } from 'lucide-react-native';
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
import { WeightEntry, WeightUnit } from '../types';
import { convertWeight, toKilograms } from '../utils/calculations';
import { sound } from '../utils/sound';
import { DatePickerField } from './DatePickerField';

cssInterop(Trash2, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(X, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });


interface EditEntryModalProps {
  entry: WeightEntry | null;
  unit: WeightUnit;
  onClose: () => void;
  onUpdate: (entry: WeightEntry) => void;
  onDelete: (id: string) => void;
}

export function EditEntryModal({
  entry,
  ...props
}: EditEntryModalProps) {
  if (!entry) return null;

  return <EditEntryModalForm key={entry.id} entry={entry} {...props} />;
}

type EditEntryModalFormProps = Omit<EditEntryModalProps, 'entry'> & {
  entry: WeightEntry;
};

function EditEntryModalForm({
  entry,
  unit,
  onClose,
  onUpdate,
  onDelete
}: EditEntryModalFormProps) {
  const [weight, setWeight] = useState<string>(convertWeight(entry.weight, unit).toFixed(2));
  const [date, setDate] = useState<string>(entry.date);
  const [notes, setNotes] = useState<string>(entry.notes || '');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const handleSave = () => {
    sound.playSuccess();
    const updated: WeightEntry = {
      ...entry,
      date,
      weight: toKilograms(Number.parseFloat(weight) || 0, unit),
      notes: notes.trim() || undefined
    };
    onUpdate(updated);
    onClose();
  };

  const handleDelete = () => {
    onDelete(entry.id);
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
            Edit Weigh-in
          </Text>

          <Pressable
            onPress={onClose}
            className="w-7 h-7 rounded-full bg-[#ECE8F5] flex-row items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </Pressable>
        </View>

        {/* Form Body */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flexShrink: 1 }}
          contentContainerStyle={{ padding: 16, gap: 14 }}
        >
          {/* Weight Input */}
          <View className="bg-[#F7F6FA] p-3.5 rounded-2xl border border-[#ECE8F5]">
            <Text className="text-[13px] font-bold text-[#645F78] uppercase block mb-1">
              Weight ({unit})
            </Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                value={weight}
                keyboardType="decimal-pad"
                onChangeText={setWeight}
                className="w-full text-[28px] font-bold text-[#161329] bg-transparent focus:outline-none tnum"
              />
            </View>
          </View>

          {/* Date Picker */}
          <DatePickerField value={date} onChange={setDate} />

          {/* Note Input */}
          <View>
            <TextInput
              placeholder="Note (optional)..."
              value={notes}
              onChangeText={setNotes}
              className="w-full bg-[#F7F6FA] border border-[#ECE8F5] rounded-xl px-3 py-4 text-[12px] text-[#161329] focus:outline-none focus:border-[#4C35DE] placeholder:text-[#A29DB5]"
            />
          </View>

          {/* Delete Option */}
          <View className="pt-1">
            {!confirmDelete ? (
              <Pressable
                onPress={() => setConfirmDelete(true)}
                className="flex-row items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <Text className="text-[15px] font-semibold text-rose-500">Delete this weigh-in</Text>
              </Pressable>
            ) : (
              <View className="flex-row items-center gap-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
                <Text className="text-[13px] text-red-700 font-medium flex-1">Delete entry?</Text>
                <Pressable
                  onPress={handleDelete}
                  className="px-2.5 py-1 bg-red-600 rounded-lg"
                >
                  <Text className="text-[14px] font-semibold text-white">Yes, Delete</Text>
                </Pressable>
                <Pressable
                  onPress={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 bg-white rounded-lg border border-gray-200"
                >
                  <Text className="text-[14px] font-semibold text-gray-700">Cancel</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          className="p-3 border-t border-[#ECE8F5]/80 bg-white flex-row items-center gap-2.5"
          style={{ flexShrink: 0 }}
        >
          <Pressable
            onPress={onClose}
            className="flex-1 h-12 rounded-full bg-[#ECE8F5] flex-row items-center justify-center"
          >
            <Text className="text-[14px] font-semibold text-[#645F78]">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            className="flex-1 h-12 rounded-full overflow-hidden bg-[#4C35DE] text-white text-[14px] font-semibold shadow-[0_4px_12px_rgba(76,53,222,0.35)] hover:shadow-[0_6px_16px_rgba(76,53,222,0.45)] active:scale-95 items-center justify-center"
          >
            <LinearGradient
              colors={['#4C35DE', '#6E54F7']}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <Text className="text-[14px] font-semibold text-white">Save</Text>
          </Pressable>
        </View>
      </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
