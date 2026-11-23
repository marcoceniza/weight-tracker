import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

interface HeaderProps {
  userName?: string;
  onOpenSettings: () => void;
}

export function Header({ userName = 'User', onOpenSettings }: HeaderProps) {
  const displayName = userName?.trim() || 'User';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning', icon: Sun };
    } else if (hour >= 12 && hour < 18) {
      return { text: 'Good afternoon', icon: Sun };
    } else {
      return { text: 'Good evening', icon: Moon };
    }
  }, []);

  const { dayName, formattedDate } = useMemo(() => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' });
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dayName: day, formattedDate: date };
  }, []);

  const GreetingIcon = greeting.icon;

  return (
    <View className="w-full relative border-b border-white/20">
      <LinearGradient
        colors={['#3D22CF', '#4C35DE', '#7B61FF']}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View className="w-full max-w-md self-center px-5 py-3.5 flex-row items-center justify-between">
        <View className="flex flex-col justify-center">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <GreetingIcon size={15} color="#FFFFFF" />
            <Text className="text-[15px] font-bold uppercase tracking-wider text-white">
              {greeting.text}
            </Text>
          </View>
          <Text className="text-[25px] font-extrabold tracking-tight text-white leading-tight truncate max-w-[190px]">
            {displayName}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View>
            <Text className="text-[18px] font-bold text-white block leading-tight text-right">
              {dayName}
            </Text>
            <Text className="text-[16px] font-medium text-white block leading-tight mt-0.5 text-right">
              {formattedDate}
            </Text>
          </View>

          <Pressable
            onPress={onOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            className="w-12 h-12 rounded-full overflow-hidden flex-row items-center justify-center bg-white shadow-[0_4px_12px_rgba(76,53,222,0.22)] ring-2 ring-white flex-shrink-0"
          >
            <Text className="text-[#5C45EE] font-bold text-[20px]">{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
