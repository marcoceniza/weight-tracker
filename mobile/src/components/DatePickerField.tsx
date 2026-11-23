import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { formatDateForStorage, parseDateForPicker } from '../utils/date';

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
}

export function DatePickerField({
  value,
  onChange,
  maximumDate
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseDateForPicker(value));

  const openPicker = () => {
    const currentDate = parseDateForPicker(value);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        maximumDate,
        onValueChange: (_event, selectedDate) => {
          onChange(formatDateForStorage(selectedDate));
        }
      });
      return;
    }

    setDraftDate(currentDate);
    setIsOpen(true);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose date, currently ${value}`}
        onPress={openPicker}
        className="bg-[#F7F6FA] px-3 py-2 rounded-2xl border border-[#ECE8F5] flex-row items-center gap-2.5"
      >
        <Calendar size={16} color="#4C35DE" />
        <View className="flex-1">
          <Text className="text-[13px] font-bold text-[#645F78] uppercase leading-none mb-0.5">
            Date
          </Text>
          <Text className="text-[15px] font-semibold text-[#161329]">
            {parseDateForPicker(value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <View className="flex-1 items-center justify-center p-5 bg-[#161329]/45">
            <View className="w-full max-w-[350px] rounded-3xl bg-white p-4">
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setDraftDate(selectedDate);
                  }
                }}
              />
              <View className="flex-row justify-end gap-4 pt-2">
                <Pressable onPress={() => setIsOpen(false)} accessibilityRole="button">
                  <Text className="text-[14px] font-semibold text-[#645F78]">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(formatDateForStorage(draftDate));
                    setIsOpen(false);
                  }}
                  accessibilityRole="button"
                >
                  <Text className="text-[14px] font-semibold text-[#4C35DE]">Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
