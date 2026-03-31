import { useState } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { Input } from "@ui/components/Input";
import { Button } from "@ui/components/Button";
import type { LoginInput } from "@shared/schemas/auth";
import { loginSchema } from "@shared/schemas/auth";

export default function LoginScreen() {
  const { signIn, isLoading } = useAuthStore();
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
      className="flex-1 bg-slate-900"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-white tracking-tight">Train Track</Text>
          <Text className="text-slate-400 mt-2 text-base">Sign in to your account</Text>
        </View>

        <View className="gap-4">
          <Input
            label="Email"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email}
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={(v) => handleChange("password", v)}
            secureTextEntry
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password}
          />

          {authError ? (
            <Text className="text-sm text-red-400 text-center">{authError}</Text>
          ) : null}

          <Button
            label="Sign In"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-400">Don&apos;t have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-blue-400 font-semibold">Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
