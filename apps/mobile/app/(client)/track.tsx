import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Period = "week" | "month" | "all";

export default function TrackScreen() {
  return (
    <View className="flex-1 bg-slate-900">
      <View className="pt-14 pb-4 px-5 border-b border-slate-800">
        <Text className="text-2xl font-bold text-white">Progress</Text>
        <Text className="text-slate-400 mt-1">Track your performance over time</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 py-4 gap-4">
        <View className="flex-row bg-slate-800 rounded-xl p-1 gap-1">
          {(["week", "month", "all"] as Period[]).map((period) => (
            <Pressable
              key={period}
              className={`flex-1 py-2 rounded-lg items-center ${
                period === "week" ? "bg-blue-600" : "active:bg-slate-700"
              }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  period === "week" ? "text-white" : "text-slate-400"
                }`}
              >
                {period === "all" ? "All Time" : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-3">
          {[
            { label: "Workouts", value: "0", icon: "barbell-outline" as const },
            { label: "Volume (kg)", value: "0", icon: "trending-up-outline" as const },
            { label: "PRs Set", value: "0", icon: "trophy-outline" as const },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-slate-800 rounded-xl p-4 items-center">
              <Ionicons name={stat.icon} size={20} color="#3b82f6" />
              <Text className="text-white font-bold text-2xl mt-2">{stat.value}</Text>
              <Text className="text-slate-500 text-xs mt-1 text-center">{stat.label}</Text>
            </View>
          ))}
        </View>

        <View className="bg-slate-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-base mb-4">Personal Records</Text>
          <View className="items-center py-8">
            <Ionicons name="trophy-outline" size={40} color="#475569" />
            <Text className="text-slate-500 mt-3 text-sm text-center">
              Log workouts to start tracking your personal records.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
