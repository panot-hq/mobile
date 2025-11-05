import AssignInteractionButton from "@/components/interactions/AssignInteractionButton";
import BaseButton from "@/components/ui/BaseButton";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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

  const handleMenuPress = () => {
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
          handleDeleteInteraction();
        }
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          zIndex: 1000,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BaseButton
          onPress={handleMenuPress}
          style={{
            padding: 8,
          }}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={24}
            color="#444"
          />
        </BaseButton>
        {interaction?.created_at && (
          <Text
            style={{
              fontSize: 12,
              color: "#444",
              fontWeight: "400",
            }}
          >
            {(() => {
              const date = new Date(interaction.created_at);
              const dayOfWeek = date.toLocaleDateString("en-US", {
                weekday: "long",
              });
              const month = date.toLocaleDateString("en-US", {
                month: "short",
              });
              const day = date.getDate();
              const year = date.getFullYear();
              const time = date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
              return `${dayOfWeek}, ${month} ${day}, ${year} at ${time}`;
            })()}
          </Text>
        )}
        <BaseButton
          onPress={() => router.back()}
          style={{
            padding: 8,
          }}
        >
          <AntDesign name="close" size={20} color="#444" />
        </BaseButton>
      </View>
      <View
        style={{
          backgroundColor: "rgba(245, 245, 245, 0.9)",
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          position: "absolute",
          top: 90,
          marginHorizontal: 20,
          zIndex: 1000,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginBottom: 6,
              fontWeight: "300",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Associated contact
          </Text>
          <Text
            style={{
              fontSize: 18,
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 200,
          paddingBottom: 40,
          gap: 20,
          height: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedPressable
          style={[
            {
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E9E9E9",
              minHeight: 200,
              justifyContent: "flex-start",
            },
            contentContainerAnimatedStyle,
          ]}
          onPress={() => setIsEditingContent(true)}
        >
          {isEditingContent ? (
            <>
              <TextInput
                style={{
                  fontSize: 16,
                  color: "#000",
                  lineHeight: 22,
                  textAlignVertical: "top",
                  fontWeight: "400",
                  minHeight: 200,
                }}
                value={contentValue}
                onChangeText={setContentValue}
                onBlur={handleContentSave}
                placeholder="Interaction content"
                multiline
                autoFocus
              />
            </>
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

        {conceptsValue && (
          <AnimatedPressable
            style={[
              {
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E9E9E9",
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
                  lineHeight: 22,
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
                {conceptsValue}
              </Text>
            )}
          </AnimatedPressable>
        )}
      </ScrollView>
    </View>
  );
}
