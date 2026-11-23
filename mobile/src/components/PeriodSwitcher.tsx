import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Timeframe } from '../types';

interface PeriodSwitcherProps {
  current: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

const PERIODS: { key: Timeframe; label: string }[] = [
  { key: '1W', label: '1W' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '1Y', label: '1Y' },
  { key: 'ALL', label: 'All' }
];

export function PeriodSwitcher({ current, onChange }: PeriodSwitcherProps) {
  return (
    <View className="bg-[#ECE8F5] p-1 rounded-full flex-row items-center justify-between w-full relative">
      {PERIODS.map(period => {
        const isActive = current === period.key;
        return (
          <Pressable
            key={period.key}
            onPress={() => {
              if (!isActive) {
                onChange(period.key);
              }
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={[
              styles.period,
              isActive ? styles.activePeriod : styles.inactivePeriod
            ]}
          >
            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  period: {
    flex: 1,
    zIndex: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activePeriod: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#4C35DE',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1
  },
  inactivePeriod: {
    backgroundColor: 'transparent'
  },
  label: {
    fontSize: 12,
    fontWeight: '600'
  },
  activeLabel: {
    color: '#161329'
  },
  inactiveLabel: {
    color: '#645F78'
  }
});
