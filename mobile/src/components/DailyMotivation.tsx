import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';
import { formatDateForStorage } from '../utils/date';
import { storage } from '../utils/storage';

const DISMISSED_DATE_KEY = 'daily_motivation_dismissed_date';

const DAILY_QUOTES = [
  'Small steps still move you forward. Keep showing up for yourself.',
  'Your progress is a practice, not a race. Take today one choice at a time.',
  'A number is one moment. Your effort is the bigger story.',
  'Consistency grows from the small promises you keep to yourself.',
  'You deserve patience on the days progress feels slow.',
  'Every check-in is useful information, not a judgment.',
  'Build habits that care for you, not rules that punish you.',
  'You can begin again at any point in your journey.',
  'Progress includes rest, resilience, and learning what works for you.',
  'Celebrate the care you put into today, whatever the scale says.',
  'Your worth does not change with a measurement.',
  'One thoughtful choice at a time is enough for today.',
  'Steady is strong. Give your routines time to grow.',
  'Listen to your body and let progress be personal.',
  'You are allowed to be proud of how far you have come.'
];

interface DailyMotivationProps {
  enabled: boolean;
}

export function DailyMotivation({ enabled }: DailyMotivationProps) {
  const [today, setToday] = useState(() => formatDateForStorage(new Date()));
  const [dismissedDate, setDismissedDate] = useState(() => {
    try {
      return storage.getItem(DISMISSED_DATE_KEY) ?? '';
    } catch (error) {
      console.warn('Unable to check whether today’s motivation was dismissed:', error);
      return '';
    }
  });
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const isOpen = dismissedDate !== today || manuallyOpened;
  const [pulse] = useState(() => new Animated.Value(0));
  const dayNumber = Number(today.replaceAll('-', ''));
  const dailyQuote = DAILY_QUOTES[dayNumber % DAILY_QUOTES.length];

  useEffect(() => {
    const timer = setInterval(() => {
      const currentDate = formatDateForStorage(new Date());
      setToday(previousDate => previousDate === currentDate ? previousDate : currentDate);
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1_100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1_100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const dismissForToday = () => {
    setDismissedDate(today);
    setManuallyOpened(false);
    try {
      storage.setItem(DISMISSED_DATE_KEY, today);
    } catch (error) {
      console.warn('Unable to save today’s motivation dismissal:', error);
    }
  };

  const animatedIconStyle = {
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
      { rotate: pulse.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) }
    ]
  };

  return (
    <>
      <Animated.View
        style={[animatedIconStyle, { position: 'absolute', bottom: 16, right: 16, zIndex: 10, elevation: 8 }]}
      >
        <Pressable
          onPress={() => setManuallyOpened(true)}
          disabled={!enabled}
          accessibilityRole="button"
          accessibilityLabel="Open today's motivation"
          className="h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-aura-glow"
        >
          <LinearGradient
            colors={['#3D22CF', '#6E54F7']}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            pointerEvents="none"
          />
          <Sparkles size={23} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      <Modal
        visible={enabled && isOpen}
        transparent
        animationType="fade"
        onRequestClose={dismissForToday}
      >
        <View className="flex-1 items-center justify-center bg-[#161329]/55 p-5">
          <View className="w-full max-w-sm overflow-hidden rounded-3xl bg-white">
            <LinearGradient
              colors={['#3D22CF', '#4C35DE', '#7B61FF']}
              style={{ padding: 22, minHeight: 190, justifyContent: 'space-between' }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={18} color="#E5DEFF" />
                  <Text className="text-[13px] font-bold uppercase tracking-wider text-white/85">
                    Today&apos;s encouragement
                  </Text>
                </View>
                <Pressable
                  onPress={dismissForToday}
                  accessibilityRole="button"
                  accessibilityLabel="Close motivation"
                  className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
                >
                  <X size={18} color="#FFFFFF" />
                </Pressable>
              </View>
              <Text className="mt-8 text-[23px] font-bold leading-8 text-white">
                “{dailyQuote}”
              </Text>
            </LinearGradient>
            <View className="p-5">
              <Text className="text-[14px] leading-5 text-[#645F78]">
                Your weight-loss journey is personal. Focus on caring for yourself one day at a time.
              </Text>
              <Pressable
                onPress={dismissForToday}
                accessibilityRole="button"
                className="mt-4 items-center rounded-full bg-[#ECE8F5] py-3"
              >
                <Text className="text-[14px] font-semibold text-[#4C35DE]">Keep going</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
