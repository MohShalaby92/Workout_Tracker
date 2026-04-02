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
import type { SignupInput } from "@shared/schemas/auth";
import { signupSchema } from "@shared/schemas/auth";
import type { UserRole } from "@shared/types/database";

export default function SignupScreen() {
  const { signUp, isSubmitting } = useAuthStore();
  const [form, setForm] = useState<SignupInput>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "client",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  function handleChange(field: keyof SignupInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setAuthError(null);
  }

  async function handleSubmit() {
    const result = signupSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignupInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const error = await signUp(form.email, form.password, form.name, form.role);
    if (error) {
      setAuthError(error);
    }
  }

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: "coach",
      label: "Coach",
      description: "Create programs & manage clients",
    },
    {
      value: "client",
      label: "Athlete",
      description: "Follow programs & track workouts",
    },
  ];

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
          <Text className="text-gray-400 text-base">Create your account</Text>
        </View>

        <View className="gap-4">
          {/* Name */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-300">
              Full Name
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
              autoCapitalize="words"
              autoComplete="name"
              placeholder="Alex Johnson"
              placeholderTextColor="#6B7280"
              className={`bg-navy-card border rounded-xl px-4 py-3 text-gray-100 text-base ${
                errors.name ? "border-red-500" : "border-navy-border"
              }`}
            />
            {errors.name ? (
              <Text className="text-xs text-red-500">{errors.name}</Text>
            ) : null}
          </View>

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
                errors.email ? "border-red-500" : "border-navy-border"
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
              placeholder="Min. 8 characters"
              placeholderTextColor="#6B7280"
              className={`bg-navy-card border rounded-xl px-4 py-3 text-gray-100 text-base ${
                errors.password ? "border-red-500" : "border-navy-border"
              }`}
            />
            {errors.password ? (
              <Text className="text-xs text-red-500">{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-gray-300">
              Confirm Password
            </Text>
            <TextInput
              value={form.confirmPassword}
              onChangeText={(v) => handleChange("confirmPassword", v)}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              className={`bg-navy-card border rounded-xl px-4 py-3 text-gray-100 text-base ${
                errors.confirmPassword ? "border-red-500" : "border-navy-border"
              }`}
            />
            {errors.confirmPassword ? (
              <Text className="text-xs text-red-500">
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>

          {/* Role picker */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-gray-300">
              I am a...
            </Text>
            <View className="flex-row gap-3">
              {roles.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() =>
                    setForm((prev) => ({ ...prev, role: r.value }))
                  }
                  className={`flex-1 p-4 rounded-xl border ${
                    form.role === r.value
                      ? "border-teal-proto bg-teal-muted"
                      : "border-navy-border bg-navy-card"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      form.role === r.value
                        ? "text-teal-proto"
                        : "text-gray-300"
                    }`}
                  >
                    {r.label}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {r.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {authError ? (
            <Text className="text-sm text-red-500 text-center">
              {authError}
            </Text>
          ) : null}

          {/* Create Account Button */}
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
                Create Account
              </Text>
            )}
          </Pressable>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400">Already have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text className="text-teal-proto font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
