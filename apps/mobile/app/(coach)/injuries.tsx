import { View, Text, ScrollView, Pressable } from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";

const INJURIES = [
  {
    id: 1,
    name: "Right ring finger fracture",
    area: "Right Hand",
    date: "Dec 2025",
    status: "Recovering" as const,
    avoid: "Heavy grip without tape",
    notes: "Dr cleared for normal pressure. Test gradually.",
  },
  {
    id: 2,
    name: "Left ulna nonunion",
    area: "Left Forearm",
    date: "Chronic",
    status: "Active" as const,
    avoid: "Dips, butterfly swings, kipping",
    notes: "Well-aligned with metal plate. Only hurts on specific movements.",
  },
];

export default function InjuriesScreen() {
  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Injuries" showDrawerToggle />

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Injuries & Limitations
          </Text>
          <Pressable className="bg-teal-proto px-5 py-2.5 rounded-lg">
            <Text className="text-navy-deep font-semibold text-[13px]">
              + Add Injury
            </Text>
          </Pressable>
        </View>

        <View className="gap-3">
          {INJURIES.map((inj) => (
            <View
              key={inj.id}
              className={`bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border ${
                inj.status === "Active"
                  ? "border-l-4 border-l-red-500"
                  : "border-l-4 border-l-amber-500"
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200">
                    {inj.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {inj.area} · {inj.date}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-2.5 py-0.5 ${
                    inj.status === "Active"
                      ? "bg-red-500/20"
                      : "bg-amber-500/20"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-semibold ${
                      inj.status === "Active"
                        ? "text-red-500"
                        : "text-amber-500"
                    }`}
                  >
                    {inj.status}
                  </Text>
                </View>
              </View>

              <View className="bg-gray-50 dark:bg-navy-input rounded-md px-3 py-2 mt-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  <Text className="text-gray-900 dark:text-gray-200 font-semibold">Avoid: </Text>
                  {inj.avoid}
                </Text>
              </View>

              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{inj.notes}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
