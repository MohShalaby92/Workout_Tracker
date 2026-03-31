import { View, Text, Pressable, Platform } from "react-native";
import { useNavigation } from "expo-router";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

interface ScreenHeaderProps {
  title: string;
  showDrawerToggle?: boolean;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, showDrawerToggle, showBack, right }: ScreenHeaderProps) {
  if (Platform.OS === "web") {
    return null;
  }

  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#E5E7EB" : "#1F2937";

  return (
    <View className="pt-14 pb-4 px-5 flex-row items-center border-b border-gray-200 dark:border-navy-border bg-white dark:bg-navy-deep">
      {showDrawerToggle ? (
        <Pressable
          onPress={() => navigation.toggleDrawer()}
          className="mr-4 -ml-1 p-1 rounded-lg active:bg-gray-100 dark:active:bg-navy-input"
          hitSlop={8}
        >
          <Ionicons name="menu-outline" size={26} color={iconColor} />
        </Pressable>
      ) : showBack ? (
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-4 -ml-1 p-1 rounded-lg active:bg-gray-100 dark:active:bg-navy-input"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={iconColor} />
        </Pressable>
      ) : null}

      <Text className="flex-1 text-gray-900 dark:text-gray-200 text-xl font-bold">{title}</Text>

      {right ?? null}
    </View>
  );
}
