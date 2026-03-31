import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";

export default function ClientProfileScreen() {
  const { profile, signOut } = useAuthStore();

  return (
    <View className="flex-1 bg-slate-900">
      <View className="pt-14 pb-4 px-5 border-b border-slate-800">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 py-4 gap-6">
        <View className="items-center py-4">
          <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-3">
            <Text className="text-white font-bold text-3xl">
              {profile?.name?.charAt(0).toUpperCase() ?? "A"}
            </Text>
          </View>
          <Text className="text-white font-bold text-xl">{profile?.name ?? "Athlete"}</Text>
          <Text className="text-slate-400 mt-1">{profile?.email ?? ""}</Text>
          <View className="mt-2 bg-green-500/20 px-3 py-1 rounded-full">
            <Text className="text-green-400 text-xs font-medium">Athlete</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          {[
            { label: "Gym", value: profile?.gym ?? "—", icon: "barbell-outline" as const },
            { label: "Unit", value: profile?.unit_pref?.toUpperCase() ?? "KG", icon: "scale-outline" as const },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-slate-800 rounded-2xl p-4 items-center">
              <Ionicons name={stat.icon} size={20} color="#3b82f6" />
              <Text className="text-white font-bold text-xl mt-2">{stat.value}</Text>
              <Text className="text-slate-500 text-xs mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Settings
          </Text>
          <View className="bg-slate-800 rounded-2xl overflow-hidden">
            {[
              { label: "Edit Profile", icon: "person-outline" as const },
              { label: "Injuries", icon: "medkit-outline" as const },
              { label: "Units (kg / lbs)", icon: "scale-outline" as const },
              { label: "Notifications", icon: "notifications-outline" as const },
            ].map((item, i) => (
              <Pressable
                key={item.label}
                className={`flex-row items-center gap-4 px-4 py-4 active:bg-slate-700 ${
                  i > 0 ? "border-t border-slate-700" : ""
                }`}
              >
                <Ionicons name={item.icon} size={20} color="#94a3b8" />
                <Text className="flex-1 text-slate-200 text-base">{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={signOut}
          className="bg-slate-800 rounded-2xl px-4 py-4 flex-row items-center gap-4 active:bg-red-900/20"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-400 text-base font-medium">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
