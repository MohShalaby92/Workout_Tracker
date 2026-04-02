import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthStore } from "@/store/auth";
import { useClientsStore } from "@/store/clients";
import type { CoachClientStatus } from "@shared/types/database";
import type { ClientWithUser } from "@/services/clients";

const FILTERS: (CoachClientStatus | "all")[] = [
  "all",
  "active",
  "pending",
  "archived",
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-teal-muted", text: "text-teal-proto" },
  pending: { bg: "bg-amber-500/20", text: "text-amber-500" },
  archived: { bg: "bg-gray-200 dark:bg-gray-700", text: "text-gray-500" },
};

export default function ClientsScreen() {
  const { session } = useAuthStore();
  const {
    isLoading,
    filter,
    searchQuery,
    fetch: fetchClients,
    invite,
    setFilter,
    setSearchQuery,
    filteredClients,
  } = useClientsStore();

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const clients = filteredClients();

  useEffect(() => {
    if (session?.user.id) {
      fetchClients(session.user.id);
    }
  }, [session?.user.id]);

  const handleInvite = useCallback(async () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    try {
      await invite(inviteEmail.trim());
      setInviteModalVisible(false);
      setInviteEmail("");
      // Re-fetch to get updated list with joined user data
      if (session?.user.id) {
        fetchClients(session.user.id);
      }
      Alert.alert("Success", "Invitation sent!");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to invite client");
    }
  }, [inviteEmail, invite, session?.user.id, fetchClients]);

  const renderClient = useCallback(
    ({ item }: { item: ClientWithUser }) => {
      const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.active;
      return (
        <Pressable className="bg-white dark:bg-navy-card rounded-xl px-4 py-3.5 border border-gray-200 dark:border-navy-border flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-teal-muted items-center justify-center">
              <Text className="text-teal-proto font-bold text-[13px]">
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="font-semibold text-sm text-gray-900 dark:text-gray-200">
                {item.user.name}
              </Text>
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                {item.user.email}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <View className={`rounded-full px-2.5 py-0.5 ${style.bg}`}>
              <Text
                className={`text-[10px] font-semibold capitalize ${style.text}`}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    },
    []
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Clients" showDrawerToggle />

      <View className="flex-1 px-5 pt-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Clients
          </Text>
          <Pressable
            onPress={() => {
              setInviteEmail("");
              setInviteModalVisible(true);
            }}
            className="flex-row items-center gap-1.5 bg-teal-proto px-5 py-2.5 rounded-lg"
          >
            <Ionicons name="add" size={14} color="#0F1117" />
            <Text className="text-navy-deep font-semibold text-[13px]">
              Invite Client
            </Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-border rounded-xl px-3 mb-4">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 py-2.5 px-2 text-gray-900 dark:text-gray-100 text-sm"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>

        {/* Filter tabs */}
        <View className="flex-row gap-2 mb-4">
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-md border ${
                filter === f
                  ? "bg-teal-proto border-teal-proto"
                  : "bg-transparent border-gray-300 dark:border-navy-border"
              }`}
            >
              <Text
                className={`text-xs capitalize ${
                  filter === f
                    ? "text-navy-deep font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading && !clients.length ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00E5CC" />
          </View>
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            renderItem={renderClient}
            contentContainerClassName="pb-8"
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                  No clients yet!
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Invite your first client to start coaching.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-navy-card rounded-t-2xl p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-200">
                Invite Client
              </Text>
              <Pressable
                onPress={() => setInviteModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Client Email
            </Text>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="client@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-6"
            />

            <Pressable
              onPress={handleInvite}
              disabled={isLoading}
              className="bg-teal-proto py-3.5 rounded-xl items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0F1117" />
              ) : (
                <Text className="text-navy-deep font-bold text-base">
                  Send Invitation
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
