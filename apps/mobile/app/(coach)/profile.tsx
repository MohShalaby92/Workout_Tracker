import { View, Text, ScrollView, Pressable, Switch, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/store/auth";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function CoachProfileScreen() {
  const { profile, signOut } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Profile" showDrawerToggle />

      <ScrollView
        className="flex-1"
        contentContainerClassName={`p-5 ${
          Platform.OS === "web" ? "max-w-[500px] self-center w-full" : ""
        }`}
      >
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-200 text-center mb-5">
          Profile
        </Text>

        {/* Avatar card */}
        <View className="bg-white dark:bg-navy-card rounded-xl p-6 border border-gray-200 dark:border-navy-border items-center mb-4">
          <View className="w-[60px] h-[60px] rounded-full bg-teal-muted items-center justify-center mb-2.5">
            <Text className="text-teal-proto font-extrabold text-[22px]">
              {profile?.name?.charAt(0).toUpperCase() ?? "C"}
            </Text>
          </View>
          <Text className="font-bold text-lg text-gray-900 dark:text-gray-200">
            {profile?.name ?? "Coach"}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {profile?.email ?? "coach@traintrack.app"}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {profile?.phone ?? "01009522073"}
          </Text>
        </View>

        {/* Menu items */}
        <Pressable className="bg-white dark:bg-navy-card rounded-xl px-4 py-3 border border-gray-200 dark:border-navy-border mb-2 flex-row justify-between items-center">
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="create-outline" size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-900 dark:text-gray-200">Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </Pressable>

        <Pressable className="bg-white dark:bg-navy-card rounded-xl px-4 py-3 border border-gray-200 dark:border-navy-border mb-2 flex-row justify-between items-center">
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-900 dark:text-gray-200">Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </Pressable>

        {/* Dark mode toggle */}
        <View className="bg-white dark:bg-navy-card rounded-xl px-4 py-3 border border-gray-200 dark:border-navy-border mt-4 mb-2 flex-row justify-between items-center">
          <View className="flex-row items-center gap-2.5">
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={16}
              color="#9CA3AF"
            />
            <Text className="text-sm text-gray-900 dark:text-gray-200">
              {isDark ? "Dark" : "Light"} Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => toggleColorScheme()}
            trackColor={{ false: "#E5E7EB", true: "#2DD4A8" }}
            thumbColor="#fff"
          />
        </View>

        {/* Logout */}
        <Pressable
          onPress={signOut}
          className="bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20 mt-4 flex-row items-center gap-2.5"
        >
          <Ionicons name="log-out-outline" size={16} color="#EF4444" />
          <Text className="text-red-500 text-sm font-semibold">Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
