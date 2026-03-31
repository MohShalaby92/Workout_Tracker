import { useState } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { ScreenHeader } from "@/components/ScreenHeader";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    return dd;
  });
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STATS = [
  { label: "WODs Done", value: 12, pct: "+8%" },
  { label: "Logs Today", value: 28, pct: "+15%" },
  { label: "Assigned Today", value: 3, pct: "100%" },
  { label: "Not Assigned", value: 0, pct: "0%" },
  { label: "Active Clients", value: 2, pct: "" },
];

export default function CoachDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const week = getWeekDates(selectedDate);
  const today = fmtDate(new Date());

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Dashboard" showDrawerToggle />

      <ScrollView className="flex-1" contentContainerClassName="p-5 gap-5">
        {/* Stats row */}
        <View className="flex-row flex-wrap gap-3">
          {STATS.map((s) => (
            <View
              key={s.label}
              className="flex-1 min-w-[130px] bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border"
            >
              <Text className="text-[28px] font-extrabold text-gray-900 dark:text-gray-200">
                {s.value}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</Text>
              {s.pct !== "" && (
                <Text className="text-[11px] text-teal-proto mt-1">{s.pct}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Two-column layout on web, stacked on mobile */}
        <View className={`gap-4 ${Platform.OS === "web" ? "flex-row" : ""}`}>
          {/* Clients Daily Log */}
          <View
            className={`bg-white dark:bg-navy-card rounded-xl p-5 border border-gray-200 dark:border-navy-border ${
              Platform.OS === "web" ? "flex-[2]" : ""
            }`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200">
                Clients Daily Log
              </Text>
              <View className="flex-row gap-2 items-center">
                <Pressable
                  onPress={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 7);
                    setSelectedDate(d);
                  }}
                >
                  <Ionicons name="chevron-back" size={16} color="#9CA3AF" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 7);
                    setSelectedDate(d);
                  }}
                >
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </Pressable>
                <Ionicons name="calendar-outline" size={16} color="#2DD4A8" />
              </View>
            </View>

            {/* Week calendar strip */}
            <View className="flex-row">
              {week.map((d, i) => {
                const isToday = fmtDate(d) === today;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setSelectedDate(d)}
                    className={`flex-1 items-center py-1.5 rounded-lg ${
                      isToday ? "bg-teal-proto" : ""
                    }`}
                  >
                    <Text
                      className={`text-[10px] uppercase ${
                        isToday ? "text-navy-deep" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {DAYS[d.getDay()]}
                    </Text>
                    <Text
                      className={`text-base font-bold mt-0.5 ${
                        isToday ? "text-navy-deep" : "text-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {d.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 items-center py-5">
              <Text className="text-[11px] text-gray-400 opacity-60">
                3 clients logged workouts today
              </Text>
            </View>
          </View>

          {/* Needs Attention */}
          <View
            className={`bg-white dark:bg-navy-card rounded-xl p-5 border border-gray-200 dark:border-navy-border ${
              Platform.OS === "web" ? "flex-1" : ""
            }`}
          >
            <View className="flex-row gap-3 mb-3">
              <Text className="text-xs font-semibold text-teal-proto border-b-2 border-teal-proto pb-1">
                Needs Attention
              </Text>
              <Text className="text-xs text-gray-400">Daily Activity</Text>
            </View>

            {/* Progress bar */}
            <View className="h-1 rounded-sm bg-red-500 mb-4">
              <View className="h-full w-2/3 rounded-sm bg-teal-proto" />
            </View>

            <View className="items-center py-4">
              <Text className="font-semibold text-[13px] text-gray-900 dark:text-gray-200 mb-1">
                Omar Hassan
              </Text>
              <Text className="text-[11px] text-gray-400">
                Pending invitation - no activity yet
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
