import { LinearGradient } from 'expo-linear-gradient';
import { Minus, Plus } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { WeightUnit } from '../types';
import { sound } from '../utils/sound';

cssInterop(Minus, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Plus, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });


interface RulerPickerProps {
  value: number; // in current active unit
  unit: WeightUnit;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  lastRecordedValue?: number;
}

export function RulerPicker({
  value,
  unit,
  onChange,
  min = 30,
  max = 200,
  lastRecordedValue
}: RulerPickerProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [panHandlers, setPanHandlers] = useState<ReturnType<typeof PanResponder.create>['panHandlers'] | null>(null);
  const startVal = useRef<number>(value);
  const lastFeedbackVal = useRef<number>(value);
  const currentValue = useRef(value);
  useEffect(() => {
    currentValue.current = value;
  }, [value]);

  const PX_PER_UNIT = 120;

  // Handle fine-tune step
  const handleStep = (step: number) => {
    const nextVal = Math.min(max, Math.max(min, Math.round((value + step) * 100) / 100));
    sound.playTap();
    onChange(nextVal);
  };

  // Quick delta pill chips
  const deltaChips = [-0.5, -0.2, 0.0, +0.2, +0.5];

  const handleApplyDelta = (delta: number) => {
    sound.playTap();
    const base = lastRecordedValue ?? value;
    const nextVal = Math.min(max, Math.max(min, Math.round((base + delta) * 100) / 100));
    onChange(nextVal);
  };

  useEffect(() => {
    const responder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startVal.current = currentValue.current;
          lastFeedbackVal.current = currentValue.current;
        },
        onPanResponderMove: (_, gesture) => {
          const rawValue = startVal.current - gesture.dx / PX_PER_UNIT;
          const nextValue = Math.min(max, Math.max(min, Math.round(rawValue * 100) / 100));

          if (nextValue !== currentValue.current) {
            if (Math.abs(nextValue - lastFeedbackVal.current) >= 0.1) {
              sound.playTick();
              sound.triggerVibrate(8);
              lastFeedbackVal.current = nextValue;
            }
            currentValue.current = nextValue;
            onChange(nextValue);
          }
        }
      });
    setPanHandlers(responder.panHandlers);
  }, [max, min, onChange]);

  // Generate visual ticks centered around value
  // Show ~30 ticks around the center (15 left, 15 right)
  const visibleTicksRange = 24;
  const currentStepIndex = Math.round(value * 10);

  const ticks: { step: number; val: number; isMajor: boolean; isMid: boolean }[] = [];
  for (let s = currentStepIndex - visibleTicksRange; s <= currentStepIndex + visibleTicksRange; s++) {
    const tickVal = s / 10;
    if (tickVal >= min && tickVal <= max) {
      const isMajor = s % 10 === 0;
      const isMid = s % 5 === 0 && !isMajor;
      ticks.push({ step: s, val: tickVal, isMajor, isMid });
    }
  }

  return (
    <View className="flex flex-col items-center w-full select-none">
      {/* Quick Delta Chips */}
      {lastRecordedValue !== undefined && (
        <View className="flex-row flex-wrap items-center justify-center gap-1.5 mb-3">
          <Text className="text-[12px] font-medium text-[#645F78] mr-1">
            Quick Adjust:
          </Text>
          {deltaChips.map(d => {
            const isSelected = Math.abs((lastRecordedValue + d) - value) < 0.005;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => handleApplyDelta(d)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Adjust ${d > 0 ? 'plus ' : d < 0 ? 'minus ' : ''}${Math.abs(d).toFixed(2)} ${unit}`}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: isSelected ? '#4C35DE' : '#ECE8F5',
                  shadowColor: isSelected ? '#4C35DE' : 'transparent',
                  shadowOpacity: isSelected ? 0.08 : 0,
                  shadowRadius: isSelected ? 14 : 0,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: isSelected ? 1 : 0
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isSelected ? '#FFFFFF' : '#645F78'
                  }}
                >
                  {d > 0 ? `+${d.toFixed(2)}` : d === 0 ? '±0.00' : d.toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Numerical Display & Steppers */}
      <View className="flex-row items-center justify-between w-full max-w-xs px-2 mb-2">
        <Pressable
         
          onPress={() => handleStep(-0.01)}
          className="w-10 h-10 rounded-full bg-[#ECE8F5] flex-row items-center justify-center"
          accessibilityLabel="Decrease 0.01"
        >
          <Minus className="w-4 h-4" />
        </Pressable>

        <View className="flex-row items-baseline gap-1 text-center">
          <Text className="text-[50px] font-bold tracking-tight text-[#161329] leading-none tnum">
            {value.toFixed(2)}
          </Text>
          <Text className="text-[20px] font-medium text-[#645F78]">
            {unit}
          </Text>
        </View>

        <Pressable
         
          onPress={() => handleStep(0.01)}
          className="w-10 h-10 rounded-full bg-[#ECE8F5] flex-row items-center justify-center"
          accessibilityLabel="Increase 0.01"
        >
          <Plus className="w-4 h-4" />
        </Pressable>
      </View>

      {/* Interactive Ruler Viewport */}
      <View
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
        {...panHandlers}
        className="w-full h-24 bg-[#F7F6FA] rounded-2xl relative overflow-hidden cursor-ew-resize touch-none items-center justify-center border border-[#ECE8F5]"
      >
        {/* Soft edge fade masks */}
        <LinearGradient
          colors={['#F7F6FA', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 64, zIndex: 10 }}
        />
        <LinearGradient
          colors={['transparent', '#F7F6FA']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 64, zIndex: 10 }}
        />

        {/* Central Violet Focus Indicator Line */}
        <View className="absolute left-1/2 top-2 bottom-2 w-[3px] bg-[#4C35DE] rounded-full z-20 pointer-events-none shadow-aura-glow transform -translate-x-1/2">
          {/* Subtle top indicator triangle */}
          <View className="w-2 h-2 bg-[#4C35DE] rotate-45 mx-auto -mt-1 rounded-xs" />
        </View>

        {/* Moving Ticks Strip */}
        <View className="absolute left-0 right-0 top-0 h-full flex-row items-center">
          {ticks.map(tick => {
            return (
              <View
                key={tick.step}
                className="absolute flex-col items-center"
                style={{
                  left: containerWidth / 2 + (tick.val - value) * PX_PER_UNIT,
                  marginLeft: -1
                }}
              >
                {/* Tick bar */}
                <View
                  className={`rounded-full ${
                    tick.isMajor
                      ? 'w-[2px] h-9 bg-[#645F78]'
                      : tick.isMid
                      ? 'w-[1.5px] h-6 bg-[#A29DB5]'
                      : 'w-[1px] h-4 bg-[#D8CEF6]'
                  }`}
                />

                {/* Major number label */}
                {tick.isMajor && (
                  <Text className="text-[10px] font-semibold text-[#645F78] mt-1.5 tnum select-none">
                    {tick.val}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <Text className="text-[13px] text-[#A29DB5] mt-1.5 text-center">
        <Text>↔ Drag ruler or use ± steppers for micro-adjustments</Text>
      </Text>
    </View>
  );
};
