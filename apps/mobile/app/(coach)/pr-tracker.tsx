import { View, Text, ScrollView, Pressable } from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";

const PRS = [
  { id: 1, movement: "Clean", kg: 80, lb: 176 },
  { id: 2, movement: "Squat Clean", kg: 79.4, lb: 175 },
  { id: 3, movement: "Back Squat", kg: 150, lb: 305 },
  { id: 4, movement: "Front Squat", kg: 102, lb: 225 },
  { id: 5, movement: "Clean & Jerk", kg: 70.3, lb: 155 },
  { id: 6, movement: "Strict Press", kg: 47.6, lb: 105 },
  { id: 7, movement: "Push Press", kg: 70, lb: 155 },
  { id: 8, movement: "Bench Press", kg: 80, lb: 175 },
  { id: 9, movement: "Power Snatch", kg: 56.7, lb: 125 },
  { id: 10, movement: "Squat Snatch", kg: 47.6, lb: 105 },
  { id: 11, movement: "Deadlift", kg: 150, lb: 330 },
  { id: 12, movement: "Plank", kg: "2:30", lb: null },
];

export default function PRTrackerScreen() {
  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="PR Tracker" showDrawerToggle />

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">
            PR Tracking & Analytics
          </Text>
          <Pressable className="bg-teal-proto px-5 py-2.5 rounded-lg">
            <Text className="text-navy-deep font-semibold text-[13px]">
              + Add PR
            </Text>
          </Pressable>
        </View>

        {/* PR cards grid */}
        <View className="flex-row flex-wrap gap-2.5 mb-5">
          {PRS.map((pr) => (
            <View
              key={pr.id}
              className="min-w-[160px] flex-1 bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border"
            >
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {pr.movement}
              </Text>
              <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-200">
                {typeof pr.kg === "number" ? `${pr.kg} kg` : pr.kg}
              </Text>
              {typeof pr.lb === "number" && (
                <Text className="text-[11px] text-teal-proto">{pr.lb} lb</Text>
              )}
            </View>
          ))}
        </View>

        {/* Strength Analysis */}
        <View className="bg-white dark:bg-navy-card rounded-xl p-5 border border-gray-200 dark:border-navy-border">
          <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200 mb-3">
            Strength Analysis
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 leading-5">
            Back Squat and Deadlift are strong at 1.67x bodyweight. Olympic
            lifts are relatively lower, suggesting room for improvement in
            technique. The strict press to push press ratio (47.6 vs 70 kg)
            shows good power transfer but potential for more overhead strength.
            Squat snatch being lower than power snatch suggests overhead squat
            mobility work is needed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
