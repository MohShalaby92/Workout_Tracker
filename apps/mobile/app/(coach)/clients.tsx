import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";

const CLIENTS = [
  { id: 1, name: "Mohamed", email: "mohamed@example.com", status: "active", programs: 3, lastActive: "Today" },
  { id: 2, name: "Sara Ahmed", email: "sara@example.com", status: "active", programs: 2, lastActive: "Yesterday" },
  { id: 3, name: "Omar Hassan", email: "omar@example.com", status: "pending", programs: 0, lastActive: "N/A" },
];

const FILTERS = ["all", "active", "pending", "archived"] as const;

export default function ClientsScreen() {
  const [filter, setFilter] = useState<string>("active");
  const filtered = CLIENTS.filter(
    (c) => filter === "all" || c.status === filter
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Clients" showDrawerToggle />

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">Clients</Text>
          <Pressable className="flex-row items-center gap-1.5 bg-teal-proto px-5 py-2.5 rounded-lg">
            <Ionicons name="add" size={14} color="#0F1117" />
            <Text className="text-navy-deep font-semibold text-[13px]">
              Invite Client
            </Text>
          </Pressable>
        </View>

        {/* Filter tabs */}
        <View className="flex-row gap-2 mb-4">
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-md border ${
                filter === f
                  ? "bg-teal-proto border-teal-proto"
                  : "bg-transparent border-gray-300 dark:border-navy-border"
              }`}
            >
              <Text
                className={`text-xs capitalize ${
                  filter === f
                    ? "text-navy-deep font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Client list */}
        <View className="gap-2">
          {filtered.map((c) => (
            <View
              key={c.id}
              className="bg-white dark:bg-navy-card rounded-xl px-4 py-3.5 border border-gray-200 dark:border-navy-border flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-teal-muted items-center justify-center">
                  <Text className="text-teal-proto font-bold text-[13px]">
                    {c.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold text-sm text-gray-900 dark:text-gray-200">
                    {c.name}
                  </Text>
                  <Text className="text-[11px] text-gray-500 dark:text-gray-400">{c.email}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-4">
                <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                  {c.programs} programs
                </Text>
                <View
                  className={`rounded-full px-2.5 py-0.5 ${
                    c.status === "active" ? "bg-teal-muted" : "bg-amber-500/20"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-semibold capitalize ${
                      c.status === "active"
                        ? "text-teal-proto"
                        : "text-amber-500"
                    }`}
                  >
                    {c.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
