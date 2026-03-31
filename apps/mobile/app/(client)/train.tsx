import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";

export default function TrainScreen() {
  const { profile } = useAuthStore();

  return (
    <View className="flex-1 bg-slate-900">
      <View className="pt-14 pb-4 px-5 border-b border-slate-800">
        <Text className="text-2xl font-bold text-white">
          Hey, {profile?.name?.split(" ")[0] ?? "Athlete"}
        </Text>
        <Text className="text-slate-400 mt-1">Ready to train?</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 py-4 gap-4">
        <View className="bg-slate-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-base mb-1">Today&apos;s Workout</Text>
          <Text className="text-slate-400 text-sm mb-4">No workout scheduled for today.</Text>

          <Pressable className="bg-blue-600 rounded-xl py-4 items-center active:bg-blue-700">
            <View className="flex-row items-center gap-2">
              <Ionicons name="play" size={18} color="#fff" />
              <Text className="text-white font-semibold text-base">Start Empty Workout</Text>
            </View>
          </Pressable>
        </View>

        <View className="bg-slate-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-base mb-4">My Program</Text>
          <View className="items-center py-8">
            <Ionicons name="layers-outline" size={40} color="#475569" />
            <Text className="text-slate-500 mt-3 text-sm text-center">
              No program assigned yet. Ask your coach to assign a program.
            </Text>
          </View>
        </View>

        <View className="bg-slate-800 rounded-2xl p-5">
          <Text className="text-white font-semibold text-base mb-4">Recent Workouts</Text>
          <View className="items-center py-8">
            <Ionicons name="time-outline" size={40} color="#475569" />
            <Text className="text-slate-500 mt-3 text-sm text-center">
              No workouts logged yet. Start training to see your history here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
