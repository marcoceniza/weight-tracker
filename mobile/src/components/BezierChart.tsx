import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Text, View } from 'react-native';
import { Circle, Defs, G, Line, Path, Rect, Stop, Svg, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';
import { WeightEntry, WeightUnit } from '../types';
import { buildBezierPath, calculateMovingAverage, convertWeight } from '../utils/calculations';
import { dateToDayNumber } from '../utils/date';

const padding = { top: 28, right: 12, bottom: 32, left: 12 };

interface BezierChartProps {
  entries: WeightEntry[];
  targetWeightKg: number;
  unit: WeightUnit;
  showMovingAverage?: boolean;
  onPinHover?: (weight: number | null) => void;
}

export function BezierChart({
  entries,
  targetWeightKg,
  unit,
  showMovingAverage = false,
  onPinHover
}: BezierChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartViewportWidth, setChartViewportWidth] = useState(0);

  // Sort entries chronological
  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

  // Compute moving averages if enabled
  const dataPoints = useMemo(() => {
    if (sorted.length === 0) return [];
    const smoothedWeights = showMovingAverage ? calculateMovingAverage(sorted, 7) : [];
    
    return sorted.map((entry, idx) => {
      const displayWeight = smoothedWeights[idx]?.weight ?? entry.weight;
      return {
        ...entry,
        displayWeightKg: displayWeight,
        convertedWeight: convertWeight(displayWeight, unit),
        rawConvertedWeight: convertWeight(entry.weight, unit),
      };
    });
  }, [sorted, showMovingAverage, unit]);

  // Dimensions
  const width = chartViewportWidth || 500;
  const height = 220;

  const targetConverted = convertWeight(targetWeightKg, unit);
  const hasTargetWeight = targetWeightKg > 0;

  // Compute min and max for chart bounds
  const { minWeight, maxWeight, points } = useMemo(() => {
    if (dataPoints.length === 0) {
      return { minWeight: 60, maxWeight: 80, points: [] };
    }

    const weights = dataPoints.map(d => d.convertedWeight);
    if (hasTargetWeight) {
      weights.push(targetConverted);
    }

    let min = Math.min(...weights);
    let max = Math.max(...weights);

    // Give breathing room
    const span = Math.max(1, max - min);
    min = Math.floor(min - span * 0.12);
    max = Math.ceil(max + span * 0.18);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const firstDay = dateToDayNumber(dataPoints[0].date);
    const dayRange = dateToDayNumber(dataPoints[dataPoints.length - 1].date) - firstDay;

    const pts = dataPoints.map((d, index) => {
      const x = dataPoints.length === 1 || dayRange === 0
        ? width / 2
        : padding.left + ((dateToDayNumber(d.date) - firstDay) / dayRange) * chartWidth;
      const normalizedY = (d.convertedWeight - min) / (max - min);
      const y = padding.top + (1 - normalizedY) * chartHeight;
      return { x, y, data: d };
    });

    return { minWeight: min, maxWeight: max, points: pts };
  }, [dataPoints, hasTargetWeight, targetConverted, width, height]);

  // Target Y axis position
  const targetY = useMemo(() => {
    if (maxWeight === minWeight) return height / 2;
    const normalizedY = (targetConverted - minWeight) / (maxWeight - minWeight);
    const chartHeight = height - padding.top - padding.bottom;
    return padding.top + (1 - Math.min(1, Math.max(0, normalizedY))) * chartHeight;
  }, [targetConverted, minWeight, maxWeight, height]);

  // Smooth bezier stroke path
  const curvePath = useMemo(() => {
    return buildBezierPath(points.map(p => ({ x: p.x, y: p.y })));
  }, [points]);

  // Area under curve path
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = height - padding.bottom;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${curvePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [curvePath, points, height]);

  // Interactive scrubber handling
  const handleTouchMove = (e: GestureResponderEvent) => {
    if (chartViewportWidth === 0 || points.length === 0) return;
    const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / chartViewportWidth));
    const targetX =
      padding.left + ratio * (width - padding.left - padding.right);

    // Find nearest point
    let nearestIdx = 0;
    let minDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - targetX);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    if (nearestIdx !== hoveredIndex) {
      setHoveredIndex(nearestIdx);
      if (onPinHover) onPinHover(points[nearestIdx].data.convertedWeight);
    }
  };

  const handleTouchEnd = () => {
    setHoveredIndex(null);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  if (sorted.length === 0) {
    return (
      <View className="w-full h-40 rounded-2xl bg-[#F7F6FA] border border-dashed border-[#ECE8F5] flex flex-col items-center justify-center p-4 text-center">
        <Text className="text-[16px] font-semibold text-[#161329] text-center">No weigh-in data yet</Text>
        <Text className="text-[13px] text-[#645F78] mt-0.5 text-center">Record your first entry to see your progress curve.</Text>
      </View>
    );
  }

  return (
    <View className="w-full relative select-none">
      <View
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full relative touch-none cursor-crosshair overflow-hidden bg-white"
      >
        <View
          className="w-full"
          onLayout={e => {
            const measuredWidth = e.nativeEvent.layout.width;
            setChartViewportWidth(current =>
              current === measuredWidth ? current : measuredWidth
            );
          }}
        >
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {/* Curve gradient stroke */}
            <SvgLinearGradient id="auraCurveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4C35DE" />
              <Stop offset="100%" stopColor="#9B86EC" />
            </SvgLinearGradient>

            {/* Subtle area gradient */}
            <SvgLinearGradient id="auraAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#9B86EC" stopOpacity="0.22" />
              <Stop offset="70%" stopColor="#D8CEF6" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </SvgLinearGradient>
          </Defs>

          {/* Goal Marker Hairline */}
          {hasTargetWeight && (
            <Line
              x1={padding.left}
              y1={targetY}
              x2={width - padding.right}
              y2={targetY}
              stroke="#A29DB5"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          )}

          {/* Goal Badge pinned to target axis */}
          {hasTargetWeight && (
            <G transform={`translate(${width - padding.right - 58}, ${targetY - 9})`}>
              <Rect
                width="58"
                height="18"
                rx="9"
                fill="#ECE8F5"
              />
              <SvgText
                x="29"
                y="12"
                textAnchor="middle"
                fontSize={10}
                fontWeight="600"
                fill="#4C35DE"
              >
                Goal {targetConverted}
              </SvgText>
            </G>
          )}

          {/* Area Fill */}
          {areaPath && (
            <Path
              d={areaPath}
              fill="url(#auraAreaFill)"
            />
          )}

          {/* Bezier Stroke Curve */}
          {curvePath && (
            <Path
              d={curvePath}
              fill="none"
              stroke="#4C35DE"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data point dots (subtle when not hovering) */}
          {points.length <= 15 && points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#FFFFFF"
              stroke="#4C35DE"
              strokeWidth="2"
            />
          ))}

          {/* Interactive Scrubber line */}
          {activePoint && (
            <G>
              <Line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={height - padding.bottom}
                stroke="#4C35DE"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <Circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#4C35DE"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            </G>
          )}

          {/* Bottom Date Axis labels */}
          {points.length > 0 && (
            <G>
              <SvgText
                x={padding.left}
                y={height - 8}
                textAnchor="start"
                fontSize={10}
                fontWeight="500"
                fill="#A29DB5"
              >
                {new Date(points[0].data.date + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </SvgText>
              <SvgText
                x={width - padding.right}
                y={height - 8}
                textAnchor="end"
                fontSize={10}
                fontWeight="500"
                fill="#A29DB5"
              >
                {new Date(points[points.length - 1].data.date + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </SvgText>
            </G>
          )}
        </Svg>
        </View>

        {/* Floating Tooltip Pill */}
        {activePoint && (
          <View
            className="absolute top-2 pointer-events-none transform -translate-x-1/2 bg-[#161329] px-3 py-1.5 rounded-full shadow-lg z-20 flex-row items-center gap-2"
            style={{
              left: `${(activePoint.x / chartViewportWidth) * 100}%`
            }}
          >
            <Text className="text-[11px] text-white/70">
              {new Date(activePoint.data.date + 'T12:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <View className="w-1 h-1 rounded-full bg-[#9B86EC]" />
            <Text className="text-[12px] font-bold text-white tnum">
              {activePoint.data.convertedWeight.toFixed(2)} {unit}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between mt-2 px-4 pb-4">
        <View className="flex-row items-center gap-2">
          <LinearGradient
            colors={['#4C35DE', '#9B86EC']}
            style={{ width: 12, height: 4, borderRadius: 999 }}
          />
          <Text className="text-[14px] text-[#645F78]">{showMovingAverage ? '7-Day Smoothed Trend' : 'Weigh-in Trend'}</Text>
        </View>
        <Text className="text-[13px] text-[#A29DB5] text-right">Drag along chart to inspect</Text>
      </View>
    </View>
  );
};
