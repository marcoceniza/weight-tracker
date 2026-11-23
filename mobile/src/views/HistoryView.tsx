import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { UserProfile, WeightEntry } from '../types';
import { formatDelta, formatWeight } from '../utils/calculations';

cssInterop(ChevronRight, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });
cssInterop(ChevronLeft, { className: { target: 'style', nativeStyleToProp: { color: 'color' } } });

const PAGE_SIZE = 10;

interface HistoryViewProps {
  profile: UserProfile;
  entries: WeightEntry[];
  onSelectEntry: (entry: WeightEntry) => void;
}

export function HistoryView({
  profile,
  entries,
  onSelectEntry
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  // Sort latest first
  const sortedDesc = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  // Deltas vs previous chronological
  const entriesWithDeltas = useMemo(() => {
    const sortedAsc = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const deltasMap = new Map<string, number>();

    for (let i = 0; i < sortedAsc.length; i++) {
      if (i === 0) {
        deltasMap.set(sortedAsc[i].id, 0);
      } else {
        const delta = sortedAsc[i].weight - sortedAsc[i - 1].weight;
        deltasMap.set(sortedAsc[i].id, delta);
      }
    }

    return sortedDesc.map(e => ({
      ...e,
      deltaKg: deltasMap.get(e.id) || 0
    }));
  }, [entries, sortedDesc]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return entriesWithDeltas;
    const term = searchTerm.toLowerCase();
    return entriesWithDeltas.filter(item =>
      item.date.includes(term) || (item.notes && item.notes.toLowerCase().includes(term))
    );
  }, [entriesWithDeltas, searchTerm]);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const pageEntries = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const firstVisibleEntry = filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const lastVisibleEntry = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);

  return (
    <View className="gap-3 pb-6">
      {/* Top Header */}
      <View>
        <Text className="text-[20px] font-bold text-[#161329]">
          History
        </Text>
        <Text className="text-[14px] text-[#645F78]">
          {entries.length} weigh-in{entries.length === 1 ? '' : 's'} recorded
        </Text>
      </View>

      {/* Search Input */}
      <View className="relative">
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 14,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <Search size={18} color="#A29DB5" />
        </View>
        <TextInput
          placeholder="Search by date or note..."
          value={searchTerm}
          onChangeText={value => {
            setSearchTerm(value);
            setPage(0);
          }}
          className="w-full pl-9 pr-4 py-4 bg-white border border-[#ECE8F5] rounded-full text-[14px] text-[#161329] focus:outline-none focus:border-[#4C35DE]"
        />
      </View>

      {/* List */}
      <View className="bg-white rounded-3xl border border-[#ECE8F5] overflow-hidden">
        {filtered.length === 0 ? (
          <View className="p-8 text-center">
            <Text className="text-[20px] font-semibold text-[#161329] text-center">No logs found</Text>
            <Text className="text-[15px] text-[#645F78] mt-1 mb-3 text-center">Try adjusting your search query or log a new weigh-in.</Text>
          </View>
        ) : (
          pageEntries.map((entry, index) => {
            const d = new Date(entry.date + 'T12:00:00');
            const delta = formatDelta(entry.deltaKg, profile.unit);

            return (
              <Pressable
                key={entry.id}
                onPress={() => {
                  onSelectEntry(entry);
                }}
                className={`w-full p-3.5 flex-row items-center justify-between hover:bg-[#F7F6FA]/60 ${
                  index < pageEntries.length - 1 || pageCount > 1 ? 'border-b border-[#ECE8F5]/80' : ''
                }`}
              >
                <View className="py-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[16px] font-bold text-[#161329]">
                      {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <Text className="text-[16px] text-[#A29DB5]">
                      {entry.timeOfDay === 'morning' ? 'Morning' : 'Evening'}
                    </Text>
                  </View>
                  {entry.notes && (
                    <Text className="text-[16px] text-[#645F78] mt-0.5 italic" numberOfLines={1} ellipsizeMode="tail">
                      &quot;{entry.notes}&quot;
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center gap-2.5">
                  <Text className="text-[16px] font-bold text-[#161329] tnum">
                    {formatWeight(entry.weight, profile.unit)}
                  </Text>
                  <View
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      delta.isNegative
                        ? 'bg-emerald-50 text-emerald-700'
                        : delta.isNeutral
                        ? 'bg-[#ECE8F5] text-[#645F78]'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <Text className={`text-[11px] font-bold tnum ${
                      delta.isNegative ? 'text-emerald-700' : delta.isNeutral ? 'text-[#645F78]' : 'text-amber-700'
                    }`}>{delta.text}</Text>
                  </View>
                  <ChevronRight className="w-4 h-4 text-[#A29DB5]" />
                </View>
              </Pressable>
            );
          })
        )}
        {pageCount > 1 && (
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-[13px] text-[#645F78]">
              {firstVisibleEntry}–{lastVisibleEntry} of {filtered.length}
            </Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setPage(currentPage - 1)}
                disabled={currentPage === 0}
                accessibilityRole="button"
                accessibilityLabel="Previous history page"
                accessibilityState={{ disabled: currentPage === 0 }}
                className={`h-9 w-9 items-center justify-center rounded-full ${currentPage === 0 ? 'bg-[#F7F6FA]' : 'bg-[#ECE8F5]'}`}
              >
                <ChevronLeft className={`h-4 w-4 ${currentPage === 0 ? 'text-[#C7C2D2]' : 'text-[#4C35DE]'}`} />
              </Pressable>
              <Text className="min-w-[68px] text-center text-[13px] font-semibold text-[#161329]">
                Page {currentPage + 1} of {pageCount}
              </Text>
              <Pressable
                onPress={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount - 1}
                accessibilityRole="button"
                accessibilityLabel="Next history page"
                accessibilityState={{ disabled: currentPage >= pageCount - 1 }}
                className={`h-9 w-9 items-center justify-center rounded-full ${currentPage >= pageCount - 1 ? 'bg-[#F7F6FA]' : 'bg-[#ECE8F5]'}`}
              >
                <ChevronRight className={`h-4 w-4 ${currentPage >= pageCount - 1 ? 'text-[#C7C2D2]' : 'text-[#4C35DE]'}`} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
