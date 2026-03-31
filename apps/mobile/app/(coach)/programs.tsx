import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";

const PROGRAMS = [
  { id: 1, name: "Strength Builder", type: "Ongoing", desc: "Focus on Olympic lifts and squat variations", exercises: 24, completed: 8 },
  { id: 2, name: "Skill Work", type: "Template", desc: "Gymnastics and skill progressions", exercises: 16, completed: 3 },
  { id: 3, name: "MetCon Prep", type: "Standard", desc: "Conditioning and WOD preparation", exercises: 32, completed: 12 },
];

export default function ProgramsScreen() {
  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Programs" showDrawerToggle />

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">Programs</Text>
          <Pressable className="flex-row items-center gap-1.5 bg-teal-proto px-5 py-2.5 rounded-lg">
            <Ionicons name="add" size={14} color="#0F1117" />
            <Text className="text-navy-deep font-semibold text-[13px]">
              Create Program
            </Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {PROGRAMS.map((p) => (
            <View
              key={p.id}
              className="min-w-[270px] flex-1 bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200">
                    {p.name}
                  </Text>
                  <Text className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {p.type} Program
                  </Text>
                </View>
                <View className="bg-teal-muted rounded-full px-2.5 py-0.5">
                  <Text className="text-[10px] text-teal-proto font-semibold">
                    {p.exercises} exercises
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">{p.desc}</Text>
              <View className="mt-3 h-1 rounded-sm bg-gray-200 dark:bg-navy-border overflow-hidden">
                <View
                  className="h-full rounded-sm bg-teal-proto"
                  style={{ width: `${(p.completed / p.exercises) * 100}%` }}
                />
              </View>
              <Text className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {p.completed}/{p.exercises} completed
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
