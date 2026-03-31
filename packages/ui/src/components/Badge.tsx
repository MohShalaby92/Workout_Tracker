import { View, Text } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: "bg-slate-100", text: "text-slate-700" },
  success: { container: "bg-green-100", text: "text-green-700" },
  warning: { container: "bg-amber-100", text: "text-amber-700" },
  danger: { container: "bg-red-100", text: "text-red-700" },
  info: { container: "bg-blue-100", text: "text-blue-700" },
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  const { container, text } = variantClasses[variant];
  return (
    <View className={`px-2.5 py-0.5 rounded-full self-start ${container}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  );
}
