import { LinearGradient } from "expo-linear-gradient";
import {
  Award,
  Calendar,
  CheckCircle,
  Compass,
  Heart,
  Sparkles,
} from "lucide-react-native";
import { cssInterop } from "nativewind";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { UserProfile, WeightEntry } from "../types";
import {
  calculateBMI,
  calculateTrendStats,
  formatDelta,
  formatWeight,
} from "../utils/calculations";

cssInterop(Award, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Calendar, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(CheckCircle, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Compass, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Heart, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Sparkles, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});

interface InsightsViewProps {
  profile: UserProfile;
  entries: WeightEntry[];
  onOpenLog: () => void;
}

export function InsightsView({
  profile,
  entries,
  onOpenLog,
}: InsightsViewProps) {
  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => a.date.localeCompare(b.date));
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
        projectedDate: null as string | null,
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

  // Calculate healthy weight range for height
  const hasValidHeight =
    Number.isFinite(profile.heightCm) && profile.heightCm > 0;
  const heightMeters = hasValidHeight ? profile.heightCm / 100 : 0;
  const minHealthyKg = 18.5 * heightMeters * heightMeters;
  const maxHealthyKg = 25 * heightMeters * heightMeters;

  const weekDelta = formatDelta(stats.last7DaysDelta, profile.unit);
  const monthDelta = formatDelta(stats.last30DaysDelta, profile.unit);

  const userName = profile.name?.trim() || "User";

  return (
    <View className="gap-4 pb-6">
      {/* Top Banner */}
      <View className="rounded-3xl p-5 relative overflow-hidden">
        <LinearGradient
          colors={["#3D22CF", "#4C35DE", "#7B61FF"]}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View className="flex-row items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D8CEF6]" />
          <Text className="text-white/80 text-[14px] font-semibold uppercase tracking-wider">
            Mindful Body Intelligence
          </Text>
        </View>
        <Text className="text-[23px] font-bold leading-tight text-white">
          {userName}&apos;s Progress Insights
        </Text>
        <Text className="text-[14px] text-white/80 mt-1 leading-relaxed">
          {hasEntries
            ? `You have logged ${entries.length} weigh-in${entries.length > 1 ? "s" : ""}. Here is your body's trend analysis.`
            : "Start by logging your first weigh-in to unlock personalized rate predictions and composition analytics."}
        </Text>
      </View>

      {/* Pace & Forecast Card */}
      <View className="bg-white rounded-3xl p-5 border border-[#ECE8F5]  gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4C35DE]" />
            <Text className="text-[17px] font-bold text-[#161329]">
              Pace & Projected Target
            </Text>
          </View>
          {stats.projectedDate && (
            <Text className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              On Track
            </Text>
          )}
        </View>

        <View className="flex-row gap-3 pt-1">
          <View className="flex-1 bg-[#F7F6FA] p-3.5 rounded-2xl border border-[#ECE8F5]">
            <Text className="text-[13px] font-bold text-[#645F78] uppercase block">
              Weekly Rate
            </Text>
            <Text className="text-[18px] font-extrabold text-[#161329] tnum mt-0.5 block">
              {hasEntries
                ? `${formatDelta(stats.weeklyRate, profile.unit).text}/wk`
                : "—"}
            </Text>
            <Text className="text-[12px] text-[#A29DB5] mt-0.5 block">
              Target: {formatDelta(profile.weeklyTargetRate, profile.unit).text}
              /wk
            </Text>
          </View>

          <View className="flex-1 bg-[#F7F6FA] p-3.5 rounded-2xl border border-[#ECE8F5]">
            <Text className="text-[13px] font-bold text-[#645F78] uppercase block">
              Estimated Goal Date
            </Text>
            <Text className="text-[16px] font-extrabold text-[#4C35DE] mt-0.5 block">
              {stats.projectedDate || (hasEntries ? "Steady Pace" : "—")}
            </Text>
            <Text className="text-[12px] text-[#A29DB5] mt-0.5 block">
              Based on logged weigh-ins
            </Text>
          </View>
        </View>

        <View className="pt-2 border-t border-[#ECE8F5] flex-row items-center justify-between">
          <Text className="text-[13px] text-[#645F78]">
            Past 7 days:{" "}
            <Text className="text-[#161329] tnum">
              {hasEntries ? weekDelta.text : "—"}
            </Text>
          </Text>
          <Text className="text-[13px] text-[#645F78]">
            Past 30 days:{" "}
            <Text className="text-[#161329] tnum">
              {hasEntries ? monthDelta.text : "—"}
            </Text>
          </Text>
        </View>
      </View>

      {/* BMI & Healthy Range */}
      <View className="bg-white rounded-3xl p-5 border border-[#ECE8F5]  gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Compass className="w-4 h-4 text-[#4C35DE]" />
            <Text className="text-[17px] font-bold text-[#161329]">
              Healthy Weight & BMI
            </Text>
          </View>
          <Text className="text-[13px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECE8F5] text-[#4C35DE]">
            {bmiInfo.label}
          </Text>
        </View>

        <View className="flex-row items-baseline gap-2">
          <Text className="text-[32px] font-extrabold text-[#161329] tnum">
            {bmiInfo.value > 0 ? bmiInfo.value.toFixed(2) : "—"}
          </Text>
          <Text className="text-[13px] font-medium text-[#645F78]">
            BMI ({hasValidHeight ? profile.heightCm : "—"} cm)
          </Text>
        </View>

        {/* Visual BMI Range Bar */}
        <View className="gap-1.5 pt-1">
          <LinearGradient
            colors={["#93C5FD", "#34D399", "#FBBF24", "#FB7185"]}
            style={{ width: "100%", height: 10, borderRadius: 999 }}
          />
          <View className="flex-row flex-wrap gap-y-1">
            <Text className="w-1/2 text-[10px] text-[#A29DB5] font-medium">
              &lt; 18.5 Under
            </Text>
            <Text className="w-1/2 text-right text-[10px] text-emerald-700 font-bold">
              18.5 – 24.9 Normal
            </Text>
            <Text className="w-1/2 text-[10px] text-[#A29DB5] font-medium">
              25 – 29.9 Over
            </Text>
            <Text className="w-1/2 text-right text-[10px] text-[#A29DB5] font-medium">
              30+ Obese
            </Text>
          </View>
        </View>

        <View className="bg-[#F7F6FA] p-3 rounded-2xl border border-[#ECE8F5] flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold text-[#645F78]">
            Normal Range for Height:
          </Text>
          <Text className="text-[12px] font-bold text-[#161329] tnum">
            {hasValidHeight
              ? `${formatWeight(minHealthyKg, profile.unit)} – ${formatWeight(maxHealthyKg, profile.unit)}`
              : "Set height in Settings"}
          </Text>
        </View>
      </View>

      {/* Milestones Celebrated */}
      <View className="bg-white rounded-3xl p-5 border border-[#ECE8F5]  gap-3">
        <View className="flex-row items-center gap-2">
          <Award className="w-4 h-4 text-[#4C35DE]" />
          <Text className="text-[17px] font-bold text-[#161329]">
            Journey Milestones
          </Text>
        </View>

        <View className="gap-2.5">
          {/* Milestone 1 */}
          <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-[#F7F6FA] border border-[#ECE8F5]">
            <CheckCircle
              className={`w-5 h-5 ${hasEntries ? "text-emerald-600" : "text-gray-300"}`}
            />
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-[#161329]">
                First Step
              </Text>
              <Text className="text-[13px] text-[#645F78]">
                Began logging weigh-ins
              </Text>
            </View>
            <Text
              className={`text-[11px] font-bold ${hasEntries ? "text-emerald-700" : "text-gray-400"}`}
            >
              {hasEntries ? "Achieved" : "Locked"}
            </Text>
          </View>

          {/* Milestone 2 */}
          <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-[#F7F6FA] border border-[#ECE8F5]">
            <CheckCircle
              className={`w-5 h-5 ${entries.length >= 7 ? "text-emerald-600" : "text-gray-300"}`}
            />
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-[#161329]">
                7-Day Ritual
              </Text>
              <Text className="text-[13px] text-[#645F78]">
                Logged 7 weigh-in records
              </Text>
            </View>
            <Text
              className={`text-[11px] font-bold ${entries.length >= 7 ? "text-emerald-700" : "text-gray-400"}`}
            >
              {entries.length >= 7 ? "Achieved" : `${entries.length}/7`}
            </Text>
          </View>

          {/* Milestone 3 */}
          <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-[#F7F6FA] border border-[#ECE8F5]">
            <CheckCircle
              className={`w-5 h-5 ${stats.progressPercent >= 50 ? "text-emerald-600" : "text-gray-300"}`}
            />
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-[#161329]">
                Halfway Destination
              </Text>
              <Text className="text-[13px] text-[#645F78]">
                50% of the path to goal
              </Text>
            </View>
            <Text
              className={`text-[11px] font-bold ${stats.progressPercent >= 50 ? "text-emerald-700" : "text-gray-400"}`}
            >
              {stats.progressPercent}%
            </Text>
          </View>
        </View>
      </View>

      {/* Mindful Compassion Note */}
      <View className="bg-[#F7F6FA] rounded-3xl p-4 border border-[#ECE8F5] flex-row items-start gap-3">
        <Heart className="w-4 h-4 text-[#4C35DE] flex-shrink-0 mt-0.5" />
        <Text className="text-[14px] text-[#645F78] leading-5">
          Daily weight naturally shifts 0.5 – 1.5 kg due to glycogen, water,
          sodium, and digestion. Trust the rolling curve over time, not any
          single morning measurement.
        </Text>
      </View>
    </View>
  );
}
