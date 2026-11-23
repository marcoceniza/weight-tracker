import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { History, House, Plus, Settings, Sparkles } from 'lucide-react-native';
import { NavTab } from '../types';
import { cssInterop } from 'nativewind';

cssInterop(History, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(House, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Plus, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Settings, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(Sparkles, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });


interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenLog: () => void;
}

export function BottomNav({
  currentTab,
  onChangeTab,
  onOpenLog
}: BottomNavProps) {
  return (
    <View className="w-full bg-white border-t border-[#ECE8F5] pt-1.5 pb-2 px-3 shadow-aura-sheet flex-shrink-0">
      <View className="w-full flex-row items-center justify-between relative h-14">
        {/* 1. Home Tab */}
        <Pressable
         
          onPress={() => onChangeTab('home')}
          className="flex-1 flex-col items-center justify-center py-1"
        >
          <View className="relative">
            <House className={`w-5 h-5 ${currentTab === 'home' ? 'text-[#4C35DE]' : 'text-[#645F78]'}`} />
            {currentTab === 'home' && (
              <View className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#4C35DE]" />
            )}
          </View>
          <Text className={`text-[10px] mt-1 ${currentTab === 'home' ? 'font-bold text-[#4C35DE]' : 'font-medium'}`}>
            Home
          </Text>
        </Pressable>

        {/* 2. Insights Tab */}
        <Pressable
         
          onPress={() => onChangeTab('insights')}
          className="flex-1 flex-col items-center justify-center py-1"
        >
          <View className="relative">
            <Sparkles className={`w-5 h-5 ${currentTab === 'insights' ? 'text-[#4C35DE]' : 'text-[#645F78]'}`} />
            {currentTab === 'insights' && (
              <View className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#4C35DE]" />
            )}
          </View>
          <Text className={`text-[10px] mt-1 ${currentTab === 'insights' ? 'font-bold text-[#4C35DE]' : 'font-medium'}`}>
            Insights
          </Text>
        </Pressable>

        {/* 3. Center Purple + Button (Elevated inside tab nav, subtle shadow, no white border) */}
        <View className="relative -top-3.5 flex-shrink-0 px-1.5">
          <Pressable
           
            onPress={onOpenLog}
            className="rounded-full overflow-hidden flex-row items-center justify-center shadow-[0_8px_20px_-2px_rgba(76,53,222,0.36)]"
            style={{ width: 52, height: 52 }}
            accessibilityLabel="Add weight"
          >
            <LinearGradient
              colors={['#3D22CF', '#4C35DE', '#6E54F7']}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <Plus className="w-6 h-6 text-white" strokeWidth={2.75} />
          </Pressable>
        </View>

        {/* 4. History Tab */}
        <Pressable
         
          onPress={() => onChangeTab('history')}
          className="flex-1 flex-col items-center justify-center py-1"
        >
          <View className="relative">
            <History className={`w-5 h-5 ${currentTab === 'history' ? 'text-[#4C35DE]' : 'text-[#645F78]'}`} />
            {currentTab === 'history' && (
              <View className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#4C35DE]" />
            )}
          </View>
          <Text className={`text-[10px] mt-1 ${currentTab === 'history' ? 'font-bold text-[#4C35DE]' : 'font-medium'}`}>
            History
          </Text>
        </Pressable>

        {/* 5. Settings Tab */}
        <Pressable
         
          onPress={() => onChangeTab('settings')}
          className="flex-1 flex-col items-center justify-center py-1"
        >
          <View className="relative">
            <Settings className={`w-5 h-5 ${currentTab === 'settings' ? 'text-[#4C35DE]' : 'text-[#645F78]'}`} />
            {currentTab === 'settings' && (
              <View className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#4C35DE]" />
            )}
          </View>
          <Text className={`text-[10px] mt-1 ${currentTab === 'settings' ? 'font-bold text-[#4C35DE]' : 'font-medium'}`}>
            Settings
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
