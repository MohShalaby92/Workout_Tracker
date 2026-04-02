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
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthStore } from "@/store/auth";
import { useProgramsStore } from "@/store/programs";
import type { Program, ProgramType } from "@shared/types/database";

const PROGRAM_TYPES: ProgramType[] = ["template", "ongoing", "standard"];

export default function ProgramsScreen() {
  const { session } = useAuthStore();
  const {
    programs,
    isLoading,
    error,
    fetch: fetchPrograms,
    create,
    update,
    remove,
  } = useProgramsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProgramType>("template");

  useEffect(() => {
    if (session?.user.id) {
      fetchPrograms(session.user.id);
    }
  }, [session?.user.id]);

  const openCreate = useCallback(() => {
    setEditingProgram(null);
    setName("");
    setDescription("");
    setType("template");
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((program: Program) => {
    setEditingProgram(program);
    setName(program.name);
    setDescription(program.description ?? "");
    setType(program.type);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Program name is required");
      return;
    }
    try {
      if (editingProgram) {
        await update(editingProgram.id, {
          name: name.trim(),
          description: description.trim() || null,
          type,
        });
      } else {
        await create({
          name: name.trim(),
          description: description.trim() || null,
          type,
          image_url: null,
        });
      }
      setModalVisible(false);
    } catch {
      Alert.alert("Error", "Failed to save program");
    }
  }, [name, description, type, editingProgram, update, create]);

  const handleDelete = useCallback(
    async (program: Program) => {
      const confirmed =
        Platform.OS === "web"
          ? window.confirm(`Delete "${program.name}"?`)
          : await new Promise<boolean>((resolve) =>
              Alert.alert(
                "Delete Program",
                `Are you sure you want to delete "${program.name}"?`,
                [
                  { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                  { text: "Delete", style: "destructive", onPress: () => resolve(true) },
                ],
                { cancelable: true, onDismiss: () => resolve(false) }
              )
            );

      if (!confirmed) return;
      try {
        await remove(program.id);
      } catch {
        Alert.alert("Error", "Failed to delete program");
      }
    },
    [remove]
  );

  const renderProgram = useCallback(
    ({ item }: { item: Program }) => (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(coach)/program-detail",
            params: { id: item.id },
          })
        }
        onLongPress={() => openEdit(item)}
        className="bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border mb-3"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200">
              {item.name}
            </Text>
            <Text className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
              {item.type} Program
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="bg-teal-muted rounded-full px-2.5 py-0.5">
              <Text className="text-[10px] text-teal-proto font-semibold capitalize">
                {item.type}
              </Text>
            </View>
            <Pressable onPress={() => openEdit(item)} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
            </Pressable>
            <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#EF5350" />
            </Pressable>
          </View>
        </View>
        {item.description ? (
          <Text
            className="text-xs text-gray-500 dark:text-gray-400 mt-2"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}
      </Pressable>
    ),
    [openEdit, handleDelete]
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Programs" showDrawerToggle />

      <View className="flex-1 px-5 pt-5">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Programs
          </Text>
          <Pressable
            onPress={openCreate}
            className="flex-row items-center gap-1.5 bg-teal-proto px-5 py-2.5 rounded-lg"
          >
            <Ionicons name="add" size={14} color="#0F1117" />
            <Text className="text-navy-deep font-semibold text-[13px]">
              Create Program
            </Text>
          </Pressable>
        </View>

        {isLoading && !programs.length ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00E5CC" />
          </View>
        ) : (
          <FlatList
            data={programs}
            keyExtractor={(item) => item.id}
            renderItem={renderProgram}
            contentContainerClassName="pb-8"
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                  No programs added yet!
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Create your first program to start building workouts for your
                  clients.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-navy-card rounded-t-2xl p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-200">
                {editingProgram ? "Edit Program" : "Create Program"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Program name"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </Text>
            <View className="flex-row gap-2 mb-6">
              {PROGRAM_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-lg border items-center ${
                    type === t
                      ? "bg-teal-proto border-teal-proto"
                      : "bg-transparent border-gray-300 dark:border-navy-border"
                  }`}
                >
                  <Text
                    className={`text-xs capitalize font-semibold ${
                      type === t
                        ? "text-navy-deep"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              disabled={isLoading}
              className="bg-teal-proto py-3.5 rounded-xl items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0F1117" />
              ) : (
                <Text className="text-navy-deep font-bold text-base">
                  {editingProgram ? "Save Changes" : "Create Program"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
