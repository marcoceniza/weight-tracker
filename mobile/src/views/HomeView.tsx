import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import { cssInterop } from "nativewind";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BezierChart } from "../components/BezierChart";
import { PeriodSwitcher } from "../components/PeriodSwitcher";
import { Timeframe, UserProfile, WeightEntry } from "../types";
import {
  calculateBMI,
  calculateTrendStats,
  formatDelta,
  formatWeight,
} from "../utils/calculations";
import { dateToDayNumber } from "../utils/date";
import { deduplicateEntriesById } from "../utils/storage";

cssInterop(ArrowRight, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Minus, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Plus, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(TrendingDown, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(TrendingUp, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});

interface HomeViewProps {
  profile: UserProfile;
  entries: WeightEntry[];
  onOpenLog: () => void;
  onGoToHistory: () => void;
  onSelectEntry: (entry: WeightEntry) => void;
}

export function HomeView({
  profile,
  entries,
  onOpenLog,
  onGoToHistory,
  onSelectEntry,
}: HomeViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
const [hoveredWeight, setHoveredWeight] = useState<number | null>(null);

  const sorted = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [entries]);

  const hasEntries = sorted.length > 0;
  const latestEntry = hasEntries ? sorted[sorted.length - 1] : undefined;
  const currentKg = latestEntry
    ? latestEntry.weight
    : profile.currentWeight || profile.startWeight || 0;

  const stats = useMemo(() => {
    if (!hasEntries) {
      return {
        current: 0,
        totalLost: 0,
        remaining: profile.targetWeight || 0,
        progressPercent: 0,
        weeklyRate: 0,
        last7DaysDelta: 0,
        last30DaysDelta: 0,
        projectedDate: null,
      };
    }
    return calculateTrendStats(
      entries,
      profile.startWeight || sorted[0].weight,
      profile.targetWeight,
    );
  }, [entries, profile, hasEntries, sorted]);

  const bmiInfo =
    currentKg > 0
      ? calculateBMI(currentKg, profile.heightCm)
      : { value: 0, label: "—", color: "#645F78" };

  // Filter entries for chart
  const chartEntries = useMemo(() => {
    if (!hasEntries) return [];
    const latestDay = dateToDayNumber(sorted[sorted.length - 1].date);

    let days = 30;
    if (timeframe === "1W") days = 7;
    else if (timeframe === "1M") days = 30;
    else if (timeframe === "3M") days = 90;
    else if (timeframe === "1Y") days = 365;
    else if (timeframe === "ALL") return sorted;

    const cutoffDay = latestDay - days;
    return sorted.filter((entry) => dateToDayNumber(entry.date) >= cutoffDay);
  }, [sorted, timeframe, hasEntries]);

  const weekDelta = formatDelta(stats.last7DaysDelta, profile.unit);
  const remainingKg =
    currentKg > 0 && profile.targetWeight > 0
      ? Math.abs(currentKg - profile.targetWeight)
      : 0;
  const isGoalReached =
    profile.targetWeight > 0 && stats.progressPercent >= 100;

  // Recent 3 logs for quick preview
  const recentThree = useMemo(() => {
    return deduplicateEntriesById(entries)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [entries]);

  return (
    <View className="gap-4 pb-6">
      {/* Current Weight Hero Card */}
      <View className="bg-white rounded-3xl p-5 border border-[#ECE8F5]  relative overflow-hidden">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[16px] font-bold tracking-wider text-[#645F78] uppercase">
            {profile.name?.trim()
              ? `${profile.name.trim()}'s Weight`
              : "Current Weight"}
          </Text>

          {/* Change tag */}
          {hasEntries ? (
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${
                weekDelta.isNegative
                  ? "bg-emerald-50"
                  : weekDelta.isNeutral
                    ? "bg-[#ECE8F5]"
                    : "bg-amber-50"
              }`}
            >
              {weekDelta.isNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
              ) : weekDelta.isNeutral ? (
                <Minus className="w-3.5 h-3.5 text-[#645F78]" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              )}
              <Text
                className={`text-[12px] font-semibold tnum ${
                  weekDelta.isNegative
                    ? "text-emerald-700"
                    : weekDelta.isNeutral
                      ? "text-[#645F78]"
                      : "text-amber-700"
                }`}
              >
                {weekDelta.text} this week
              </Text>
            </View>
          ) : (
            <Text className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#ECE8F5] text-[#4C35DE]">
              Ready to begin
            </Text>
          )}
        </View>

        {/* Big Weight Number */}
        <View className="flex-row items-baseline gap-2 my-2">
          <Text className="text-[48px] font-extrabold tracking-tight text-[#161329] leading-none tnum">
            {hasEntries ? formatWeight(currentKg, profile.unit, false) : "—"}
          </Text>
          <Text className="text-[20px] font-semibold text-[#645F78]">
            {profile.unit}
          </Text>
        </View>

        {/* Date line */}
        <Text className="text-[15px] text-[#A29DB5] mb-4">
          {latestEntry
            ? `Latest: ${new Date(
                latestEntry.date + "T12:00:00",
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} (${latestEntry.timeOfDay === "morning" ? "Morning" : "Evening"})`
            : "No weigh-ins logged yet"}
        </Text>

        {/* Target Progress Bar */}
        <View className="pt-3 border-t border-[#ECE8F5]">
          <View className="flex-row items-center justify-between text-[11px] font-semibold text-[#645F78] mb-1.5">
            <Text className="text-[13px] font-semibold text-[#645F78]">
              {profile.startWeight > 0
                ? `Start: ${formatWeight(profile.startWeight, profile.unit)}`
                : "Start: —"}
            </Text>
            <Text className="text-[13px] font-semibold text-[#4C35DE]">
              {isGoalReached
                ? "Goal Achieved! 🎉"
                : remainingKg > 0
                  ? `${formatWeight(remainingKg, profile.unit, false)} ${profile.unit} to goal`
                  : profile.targetWeight > 0
                    ? `Target: ${formatWeight(profile.targetWeight, profile.unit)}`
                    : "Set target in Settings"}
            </Text>
            <Text className="text-[13px] font-semibold text-[#645F78]">
              {profile.targetWeight > 0
                ? `Target: ${formatWeight(profile.targetWeight, profile.unit)}`
                : "Target: —"}
            </Text>
          </View>

          <View className="w-full h-2 rounded-full bg-[#ECE8F5] overflow-hidden">
            <LinearGradient
              colors={["#4C35DE", "#9B86EC"]}
              style={{
                width: `${stats.progressPercent}%`,
                height: "100%",
                borderRadius: 999,
              }}
            />
          </View>
        </View>
      </View>

      {/* Chart Card */}
      <View className="bg-white rounded-3xl p-0 border border-[#ECE8F5]  gap-3 overflow-hidden">
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#161329]">
            Weight Trend
          </Text>
          <Text className="text-[15px] font-medium text-[#645F78]">
            {chartEntries.length} data points
          </Text>
        </View>

        {hasEntries && (
          <View className="mx-4">
            <PeriodSwitcher current={timeframe} onChange={setTimeframe} />
            {hoveredWeight !== null && (
              <View className="mx-4 p-2 bg-white rounded-2xl border border-[#ECE8F5]">
                <Text className="text-[14px] font-semibold text-[#161329]">Pin: {hoveredWeight.toFixed(2)} {profile.unit}</Text>
              </View>
            )}
          </View>
        )}

        <BezierChart
          entries={chartEntries}
          targetWeightKg={profile.targetWeight || 0}
          unit={profile.unit}
          showMovingAverage={false}
          onPinHover={setHoveredWeight}
        />
      </View>

      {/* 3 Quick Stat Cards */}
      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-white p-3 rounded-2xl border border-[#ECE8F5] ">
          <Text className="text-[11px] font-bold text-[#645F78] uppercase block">
            Total Change
          </Text>
          <Text className="text-[20px] font-bold text-[#161329] tnum mt-0.5 block">
            {hasEntries ? formatDelta(stats.totalLost, profile.unit).text : "—"}
          </Text>
        </View>

        <View className="flex-1 bg-white p-3 rounded-2xl border border-[#ECE8F5] ">
          <Text className="text-[11px] font-bold text-[#645F78] uppercase block">
            To Target
          </Text>
          <Text className="text-[20px] font-bold text-[#4C35DE] tnum mt-0.5 block">
            {remainingKg > 0 ? formatWeight(remainingKg, profile.unit) : "—"}
          </Text>
        </View>

        <View className="flex-1 bg-white p-3 rounded-2xl border border-[#ECE8F5] ">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-bold text-[#645F78] uppercase block">
              BMI
            </Text>
            <Text
              className={`text-[9px] text-center font-semibold px-2 py-0.5 rounded-full ${
                bmiInfo.label === "Underweight"
                  ? "bg-indigo-100 text-indigo-800"
                  : bmiInfo.label === "Normal range"
                    ? "bg-emerald-100 text-emerald-800"
                    : bmiInfo.label === "Overweight"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
              }`}
            >
              {bmiInfo.label}
            </Text>
          </View>
          <View className="flex-row items-baseline gap-1 mt-0.5">
            <Text className="text-[20px] font-bold text-[#161329] tnum">
              {bmiInfo.value > 0 ? bmiInfo.value.toFixed(2) : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Entries Strip */}
      <View className="bg-white rounded-3xl p-4 border border-[#ECE8F5]  gap-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[18px] font-bold text-[#161329]">
            Recent Entries
          </Text>
          {hasEntries && (
            <Pressable
              onPress={() => {
                onGoToHistory();
              }}
              className="flex-row items-center gap-0.5"
            >
              <Text className="text-[11px] font-semibold text-[#4C35DE]">
                View All
              </Text>
              <ArrowRight className="w-3 h-3" />
            </Pressable>
          )}
        </View>

        {recentThree.length === 0 ? (
          <View className="py-6 px-3 text-center bg-[#F7F6FA] rounded-2xl border border-dashed border-[#ECE8F5]">
            <Text className="text-[16px] font-semibold text-[#161329] text-center">
              No weigh-ins yet
            </Text>
            <Text className="text-[13px] text-[#645F78] mt-0.5 mb-3 text-center">
              Start your journey with your first weigh-in.
            </Text>
            <Pressable
              onPress={() => {
                onOpenLog();
              }}
              className="px-4 py-2 rounded-full bg-[#4C35DE] w-[160px] justify-center mx-auto flex-row items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] text-white" />
              <Text className="text-[14px] font-semibold text-white">
                Log First Weight
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {recentThree.map((item, index) => {
              const d = new Date(item.date + "T12:00:00");
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    onSelectEntry(item);
                  }}
                  className={`w-full py-2.5 flex-row items-center justify-between rounded-xl px-1.5 ${
                    index < recentThree.length - 1
                      ? "border-b border-[#ECE8F5]/80"
                      : ""
                  }`}
                >
                  <View>
                    <Text className="text-[13px] font-semibold text-[#161329] text-right">
                      {d.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text className="text-[13px] text-[#645F78] text-right">
                      {(new Date(`1970-01-01T${item.time || "07:30"}`).toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12:true}))}{" "}
                      {item.notes ? `• "${item.notes.slice(0, 24)}..."` : ""}
                    </Text>
                  </View>
                  <View className="text-right">
                    <Text className="text-[14px] font-bold text-[#161329] tnum">
                      {formatWeight(item.weight, profile.unit)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
