import { Pressable, Text, ActivityIndicator } from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-blue-600 active:bg-blue-700",
    text: "text-white font-semibold",
  },
  secondary: {
    container: "bg-slate-700 active:bg-slate-800",
    text: "text-white font-semibold",
  },
  outline: {
    container: "border border-blue-600 active:bg-blue-50",
    text: "text-blue-600 font-semibold",
  },
  ghost: {
    container: "active:bg-slate-100",
    text: "text-slate-700 font-semibold",
  },
  danger: {
    container: "bg-red-600 active:bg-red-700",
    text: "text-white font-semibold",
  },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "px-3 py-2 rounded-lg", text: "text-sm" },
  md: { container: "px-5 py-3 rounded-xl", text: "text-base" },
  lg: { container: "px-6 py-4 rounded-xl", text: "text-lg" },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const { container, text } = variantClasses[variant];
  const sizeStyle = sizeClasses[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        flex-row items-center justify-center
        ${container}
        ${sizeStyle.container}
        ${fullWidth ? "w-full" : "self-start"}
        ${disabled || loading ? "opacity-50" : ""}
      `}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text className={`${text} ${sizeStyle.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
