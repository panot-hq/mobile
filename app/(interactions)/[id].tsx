import AssignInteractionButton from "@/components/interactions/AssignInteractionButton";
import Badge from "@/components/ui/Badge";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import {
  formatCreatedAtDate,
  formatCreatedAtTime,
} from "@/lib/utils/dateFormatter";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function InteractionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { getInteraction, updateInteraction, deleteInteraction } =
    useInteractions();
  const { getContact } = useContacts();
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isEditingConcepts, setIsEditingConcepts] = useState(false);
  const [contentValue, setContentValue] = useState("");
  const [conceptsValue, setConceptsValue] = useState("");

  // Get interaction from Legend State (reactive)
  const interaction = getInteraction(id as string);

  // Get associated contact if exists
  const contact = interaction?.contact_id
    ? getContact(interaction.contact_id)
    : null;

  // Update local editing values when interaction changes
  useEffect(() => {
    if (interaction) {
      setContentValue(interaction.raw_content || "");
      setConceptsValue(interaction.key_concepts || "");
    }
  }, [interaction]);

  const handleContentSave = async () => {
    if (interaction && contentValue !== interaction.raw_content) {
      try {
        // Use Legend State to update (works offline)
        updateInteraction(interaction.id, { raw_content: contentValue });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating interaction:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingContent(false);
  };

  const handleConceptsSave = async () => {
    if (interaction && conceptsValue !== interaction.key_concepts) {
      try {
        // Use Legend State to update (works offline)
        updateInteraction(interaction.id, { key_concepts: conceptsValue });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating interaction:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingConcepts(false);
  };

  const handleDeleteInteraction = () => {
    if (!interaction) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Eliminar Interacción"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "Eliminar Interacción",
        message:
          "¿Estás seguro de que quieres eliminar esta interacción? Esta acción no se puede deshacer.",
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            // Use Legend State to delete (works offline)
            deleteInteraction(interaction.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch (error) {
            console.error("Error deleting interaction:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "No se pudo eliminar la interacción");
          }
        }
      }
    );
  };

  const contentContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditingContent ? 0 : 0,
  }));

  const conceptsContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditingConcepts ? 0 : 0,
    borderColor: "#E9E9E9",
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          paddingTop: 30,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            backgroundColor: "#eee",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 30,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              color: "#000",
              fontWeight: "400",
              paddingLeft: 5,
            }}
          >
            {interaction?.created_at
              ? formatCreatedAtDate(interaction.created_at)
              : ""}
          </Text>
          <Text
            style={{
              fontSize: 24,
              color: "#000",
              fontWeight: "400",
              paddingRight: 5,
            }}
          >
            {interaction?.created_at
              ? formatCreatedAtTime(interaction.created_at)
              : ""}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Badge
          title="content"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={5}
        />

        <AnimatedPressable
          style={[
            {
              borderWidth: 1,
              borderColor: "#ddd",
              marginBottom: 20,
              justifyContent: "center",
            },
            contentContainerAnimatedStyle,
          ]}
          onPress={() => setIsEditingContent(true)}
        >
          {isEditingContent ? (
            <TextInput
              style={{
                fontSize: 16,
                color: "#000",
                lineHeight: 22,
                textAlignVertical: "top",
                fontWeight: "400",
              }}
              value={contentValue}
              onChangeText={setContentValue}
              onBlur={handleContentSave}
              placeholder="Interaction content"
              multiline
              autoFocus
            />
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: "#000",
                lineHeight: 22,
              }}
            >
              {contentValue || ""}
            </Text>
          )}
        </AnimatedPressable>

        <Badge
          title="key concepts"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={5}
        />

        <AnimatedPressable
          style={[
            {
              borderWidth: 1,
              borderColor: "#E9E9E9",
              marginBottom: 20,
            },
            conceptsContainerAnimatedStyle,
          ]}
          onPress={() => setIsEditingConcepts(true)}
        >
          {isEditingConcepts ? (
            <TextInput
              style={{
                fontSize: 16,
                color: "#000",
                textAlignVertical: "top",
              }}
              value={conceptsValue}
              onChangeText={setConceptsValue}
              onBlur={handleConceptsSave}
              multiline
              autoFocus
            />
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: "#000",
                lineHeight: 22,
              }}
            >
              {conceptsValue || "No key concepts"}
            </Text>
          )}
        </AnimatedPressable>

        <View
          style={{
            backgroundColor: "rgba(245, 245, 245, 0.8)",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#E9E9E9",
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 5,
              }}
            >
              Associated contact
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#000",
                fontWeight: "500",
              }}
            >
              {contact
                ? `${contact.first_name} ${contact.last_name}`
                : "Unassigned"}
            </Text>
          </View>
          <AssignInteractionButton
            onPress={() =>
              router.push(`/(interactions)/assign?interactionId=${id}`)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}
