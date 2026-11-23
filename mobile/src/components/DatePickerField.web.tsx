import { Calendar } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  return (
    <View className="bg-[#F7F6FA] px-3 py-2 rounded-2xl border border-[#ECE8F5] flex-row items-center gap-2.5">
      <Calendar size={16} color="#4C35DE" />
      <View className="flex-1">
        <Text className="text-[9px] font-bold text-[#645F78] uppercase leading-none mb-0.5">
          Date
        </Text>
        <input
          aria-label="Date"
          type="date"
          required
          value={value}
          onChange={event => onChange(event.currentTarget.value)}
          style={{
            width: '100%',
            padding: 0,
            border: 0,
            background: 'transparent',
            color: '#161329',
            fontSize: 12,
            fontWeight: 600,
            outline: 'none'
          }}
        />
      </View>
    </View>
  );
}
