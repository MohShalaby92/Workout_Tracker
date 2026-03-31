import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";

const VIDEOS = [
  { id: 1, title: "Squat Clean Technique", category: "Olympic Lifting" },
  { id: 2, title: "Double Under Progression", category: "Skills" },
];

export default function LibraryScreen() {
  const [tab, setTab] = useState<"video" | "workout">("video");

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Library" showDrawerToggle />

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Tab bar */}
        <View className="flex-row rounded-xl overflow-hidden border border-gray-200 dark:border-navy-border mb-5">
          {(["video", "workout"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-3 items-center ${
                tab === t ? "bg-teal-proto" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  tab === t ? "text-navy-deep" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {t === "video" ? "Video Library" : "Workout Library"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "video" ? (
          <View>
            <View className="flex-row justify-end mb-4">
              <Pressable className="bg-teal-proto px-5 py-2.5 rounded-lg">
                <Text className="text-navy-deep font-semibold text-[13px]">
                  + Add Video
                </Text>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {VIDEOS.map((v) => (
                <View
                  key={v.id}
                  className="min-w-[240px] flex-1 bg-white dark:bg-navy-card rounded-xl border border-gray-200 dark:border-navy-border overflow-hidden"
                >
                  <View className="bg-gray-100 dark:bg-navy-input h-[120px] items-center justify-center">
                    <Ionicons
                      name="videocam-outline"
                      size={32}
                      color="#9CA3AF"
                    />
                  </View>
                  <View className="p-3.5">
                    <Text className="font-semibold text-[13px] text-gray-900 dark:text-gray-200">
                      {v.title}
                    </Text>
                    <Text className="text-[11px] text-teal-proto mt-1">
                      {v.category}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row justify-end mb-4">
              <Pressable className="bg-teal-proto px-5 py-2.5 rounded-lg">
                <Text className="text-navy-deep font-semibold text-[13px]">
                  + Add Template Exercise
                </Text>
              </Pressable>
            </View>

            <View className="bg-white dark:bg-navy-card rounded-xl p-6 border border-gray-200 dark:border-navy-border items-center">
              <Ionicons name="fitness-outline" size={40} color="#9CA3AF" />
              <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                Build your exercise library
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                Add template exercises with descriptions and video links
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
