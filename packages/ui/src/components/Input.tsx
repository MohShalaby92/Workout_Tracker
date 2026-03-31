import { View, Text, TextInput } from "react-native";
import type { TextInputProps } from "react-native";

interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...props }: InputProps) {
  return (
    <View className="gap-1">
      {label ? (
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Text>
      ) : null}
      <TextInput
        className={`
          bg-slate-100 dark:bg-slate-800
          border rounded-xl
          px-4 py-3
          text-slate-900 dark:text-slate-100
          text-base
          ${error ? "border-red-500" : "border-slate-200 dark:border-slate-700"}
        `}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? (
        <Text className="text-xs text-red-500">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-slate-500">{hint}</Text>
      ) : null}
    </View>
  );
}
