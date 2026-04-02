import { useState } from "react";
import { Platform, View, Text, Pressable, ScrollView } from "react-native";
import { Slot, usePathname, router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useAuthStore } from "@/store/auth";

type NavItem = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const NAV_ITEMS: NavItem[] = [
  { name: "dashboard", label: "Dashboard", icon: "grid-outline", iconActive: "grid" },
  { name: "programs", label: "Programs", icon: "document-text-outline", iconActive: "document-text" },
  { name: "clients", label: "Clients", icon: "people-outline", iconActive: "people" },
  { name: "library", label: "Library", icon: "book-outline", iconActive: "book" },
  { name: "pr-tracker", label: "PR Tracker", icon: "trophy-outline", iconActive: "trophy" },
  { name: "injuries", label: "Injuries", icon: "alert-circle-outline", iconActive: "alert-circle" },
  { name: "profile", label: "Profile", icon: "person-outline", iconActive: "person" },
];

function isRouteActive(pathname: string, name: string): boolean {
  return pathname === `/${name}` || pathname.startsWith(`/${name}/`);
}

function WebSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className={`${collapsed ? "w-[60px]" : "w-[200px]"} bg-white dark:bg-navy-sidebar border-r border-gray-200 dark:border-navy-border`}>
      {/* Logo */}
      <View className={`${collapsed ? "px-3" : "px-5"} pt-5 pb-6 border-b border-gray-200 dark:border-navy-border mb-3`}>
        {collapsed ? (
          <Text className="text-gray-900 dark:text-gray-200 text-base font-black text-center">TT</Text>
        ) : (
          <>
            <View className="border-t-[3px] border-gray-900 dark:border-gray-200 pt-1.5">
              <Text className="text-gray-900 dark:text-gray-200 text-[22px] font-black leading-none">train</Text>
              <Text className="text-gray-900 dark:text-gray-200 text-[22px] font-black leading-none">track</Text>
            </View>
            <View className="border-t-[3px] border-gray-900 dark:border-gray-200 mt-1.5" />
          </>
        )}
      </View>

      {/* Nav items */}
      <View className="flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.name);
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(`/(coach)/${item.name}` as never)}
              className={`flex-row items-center ${collapsed ? "justify-center px-0" : "px-5"} gap-2.5 py-2.5 ${
                active
                  ? "bg-gray-100 dark:bg-navy-input border-l-[3px] border-teal-proto"
                  : "border-l-[3px] border-transparent"
              }`}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={16}
                color={active ? (isDark ? "#E5E7EB" : "#1F2937") : "#9CA3AF"}
              />
              {!collapsed && (
                <Text
                  className={`text-[13px] ${
                    active ? "text-gray-900 dark:text-gray-200 font-bold" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Bottom: Sign out + collapse toggle */}
      <View className="border-t border-gray-200 dark:border-navy-border">
        <Pressable
          onPress={signOut}
          className={`flex-row items-center ${collapsed ? "justify-center" : "px-5"} gap-2.5 py-2.5`}
        >
          <Ionicons name="log-out-outline" size={16} color="#EF4444" />
          {!collapsed && (
            <Text className="text-red-500 text-[13px] font-medium">Sign Out</Text>
          )}
        </Pressable>
        <Pressable onPress={onToggle} className="items-center py-3">
          <Ionicons
            name={collapsed ? "chevron-forward" : "chevron-back"}
            size={16}
            color="#9CA3AF"
          />
        </Pressable>
      </View>
    </View>
  );
}

function WebLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 flex-row bg-gray-100 dark:bg-navy-deep">
      <WebSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <View className="flex-1">
        {/* Top bar with notification bell */}
        <View className="flex-row justify-end items-center px-7 pt-4 pb-2">
          <Pressable className="p-1.5 rounded-lg">
            <Ionicons name="notifications-outline" size={20} color={isDark ? "#E5E7EB" : "#1F2937"} />
          </Pressable>
        </View>
        <View className="flex-1">
          <Slot />
        </View>
      </View>
    </View>
  );
}

function MobileDrawerContent() {
  const pathname = usePathname();
  const { signOut, profile } = useAuthStore();

  return (
    <View className="flex-1 bg-white dark:bg-navy-sidebar">
      <View className="pt-14 pb-6 px-5 border-b border-gray-200 dark:border-navy-border">
        <View className="w-12 h-12 rounded-full bg-teal-muted items-center justify-center mb-3">
          <Text className="text-teal-proto font-bold text-lg">
            {profile?.name?.charAt(0).toUpperCase() ?? "C"}
          </Text>
        </View>
        <Text className="text-gray-900 dark:text-gray-200 font-semibold text-base">
          {profile?.name ?? "Coach"}
        </Text>
        <Text className="text-gray-400 text-sm">{profile?.email ?? ""}</Text>
      </View>

      <ScrollView className="flex-1 pt-3">
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.name);
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(`/(coach)/${item.name}` as never)}
              className={`flex-row items-center gap-3 mx-3 px-4 py-3 rounded-xl mb-1 ${
                active ? "bg-gray-100 dark:bg-navy-input" : ""
              }`}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={22}
                color={active ? "#2DD4A8" : "#9CA3AF"}
              />
              <Text
                className={`text-sm font-medium ${
                  active ? "text-gray-900 dark:text-gray-200" : "text-gray-400"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="p-5 border-t border-gray-200 dark:border-navy-border">
        <Pressable
          onPress={signOut}
          className="flex-row items-center gap-3 px-4 py-3 rounded-xl"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 text-sm font-medium">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function CoachLayout() {
  if (Platform.OS === "web") {
    return <WebLayout />;
  }

  return (
    <Drawer
      drawerContent={() => <MobileDrawerContent />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.6)",
      }}
    >
      <Drawer.Screen name="dashboard" />
      <Drawer.Screen name="programs" />
      <Drawer.Screen name="program-detail" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="clients" />
      <Drawer.Screen name="library" />
      <Drawer.Screen name="pr-tracker" />
      <Drawer.Screen name="injuries" />
      <Drawer.Screen name="profile" />
    </Drawer>
  );
}
