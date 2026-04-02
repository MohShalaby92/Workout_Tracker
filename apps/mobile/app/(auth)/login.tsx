import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import type { LoginInput } from "@shared/schemas/auth";
import { loginSchema } from "@shared/schemas/auth";

export default function LoginScreen() {
  const { signIn, isSubmitting } = useAuthStore();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginInput>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  function handleChange(field: keyof LoginInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setAuthError(null);
  }

  async function handleSubmit() {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<LoginInput> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const error = await signIn(form.email, form.password);
    if (error) {
      setAuthError(error);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-navy-deep"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="border-t-[3px] border-gray-200 pt-1.5 mb-1">
            <Text className="text-gray-200 text-[32px] font-black leading-none">
              train
            </Text>
            <Text className="text-gray-200 text-[32px] font-black leading-none">
              track
            </Text>
          </View>
          <View className="border-t-[3px] border-gray-200 w-[120px] mt-1.5 mb-4" />
          <Text className="text-gray-400 text-base">
            Sign in to your account
          </Text>
        </View>

        <View className="gap-4">
          {/* Email */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-300">Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor="#6B7280"
              className={`bg-navy-card border rounded-xl px-4 py-3 text-gray-100 text-base ${
                errors.email
                  ? "border-red-500"
                  : "border-navy-border"
              }`}
            />
            {errors.email ? (
              <Text className="text-xs text-red-500">{errors.email}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-300">Password</Text>
            <TextInput
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
              secureTextEntry
              autoComplete="current-password"
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              className={`bg-navy-card border rounded-xl px-4 py-3 text-gray-100 text-base ${
                errors.password
                  ? "border-red-500"
                  : "border-navy-border"
              }`}
            />
            {errors.password ? (
              <Text className="text-xs text-red-500">{errors.password}</Text>
            ) : null}
          </View>

          {authError ? (
            <Text className="text-sm text-red-500 text-center">
              {authError}
            </Text>
          ) : null}

          {/* Sign In Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`bg-teal-proto py-3.5 rounded-xl items-center ${
              isSubmitting ? "opacity-50" : ""
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0F1117" />
            ) : (
              <Text className="text-navy-deep font-bold text-base">
                Sign In
              </Text>
            )}
          </Pressable>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400">Don&apos;t have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-teal-proto font-semibold">Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
