import { useState } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { Input } from "@ui/components/Input";
import { Button } from "@ui/components/Button";
import type { SignupInput } from "@shared/schemas/auth";
import { signupSchema } from "@shared/schemas/auth";
import type { UserRole } from "@shared/types/database";

export default function SignupScreen() {
  const { signUp, isLoading } = useAuthStore();
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
    { value: "coach", label: "Coach", description: "Create programs & manage clients" },
    { value: "client", label: "Athlete", description: "Follow programs & track workouts" },
  ];

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
          <Text className="text-slate-400 mt-2 text-base">Create your account</Text>
        </View>

        <View className="gap-4">
          <Input
            label="Full Name"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Alex Johnson"
            error={errors.name}
          />

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
            placeholder="Min. 8 characters"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(v) => handleChange("confirmPassword", v)}
            secureTextEntry
            placeholder="••••••••"
            error={errors.confirmPassword}
          />

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-300">I am a...</Text>
            <View className="flex-row gap-3">
              {roles.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() => setForm((prev) => ({ ...prev, role: r.value }))}
                  className={`flex-1 p-4 rounded-xl border ${
                    form.role === r.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      form.role === r.value ? "text-blue-400" : "text-slate-300"
                    }`}
                  >
                    {r.label}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">{r.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {authError ? (
            <Text className="text-sm text-red-400 text-center">{authError}</Text>
          ) : null}

          <Button
            label="Create Account"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-400">Already have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text className="text-blue-400 font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
