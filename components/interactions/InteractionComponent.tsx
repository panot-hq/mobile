import { useInteractionOverlay } from "@/contexts/InteractionOverlayContext";
import { useInteractions } from "@/lib/hooks/useLegendState";
import { formatCreatedAt } from "@/lib/utils/dateFormatter";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import { ActionSheetIOS, Alert, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import AssignInteractionButton from "./AssignInteractionButton";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface InteractionProps {
  interactionId: string;
  createdAt: string;
  rawContent: string;
}

export default function Interaction({
  interactionId,
  createdAt,
  rawContent,
}: InteractionProps) {
  const scale = useSharedValue(1);
  const { showOverlay } = useInteractionOverlay();
  const { deleteInteraction } = useInteractions();
  const componentRef = useRef<View>(null);
  const formatted = formatCreatedAt(createdAt);

  let datePart = formatted;
  let hourPart = "";
  if (formatted.includes("at")) {
    const [date, hour] = formatted.split("at");
    datePart = date.trim();
    hourPart = hour.trim();
  }

  const truncatedContent =
    rawContent.length > 20 ? rawContent.substring(0, 30) + "..." : rawContent;

  const handleAssignInteraction = () => {
    router.push(`/(interactions)/assign?interactionId=${interactionId}`);
  };

  const handleDeleteInteraction = (callback?: () => void) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Eliminar Interacción"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "Eliminar Interacción",
        message:
          "¿Estás seguro de que quieres eliminar esta interacción? Esta acción no se puede deshacer.",
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            deleteInteraction(interactionId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (callback) {
              setTimeout(() => {
                callback();
              }, 400);
            }
          } catch (error) {
            console.error("Error deleting interaction:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "No se pudo eliminar la interacción");
          }
        } else {
          if (callback) {
            callback();
          }
        }
      }
    );
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (componentRef.current) {
      componentRef.current.measureInWindow((x, y, width, height) => {
        showOverlay(
          {
            id: interactionId,
            createdAt,
            rawContent,
            datePart,
            hourPart,
            initialLayout: { x, y, width, height },
          },
          [
            {
              label: "ASSIGN",
              onPress: handleAssignInteraction,
            },
            {
              label: "DELETE",
              onPress: handleDeleteInteraction,
              destructive: true,
            },
          ]
        );
      });
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(1.02);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(interactions)/${interactionId}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      ref={componentRef}
      onLongPress={handleLongPress}
      key={interactionId}
      style={[
        {
          padding: 20,
          backgroundColor: "white",
          borderRadius: 25,
          borderWidth: 1,
          borderColor: "#ddd",
          gap: 10,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 13 }}>{datePart}</Text>
        <Text style={{ fontSize: 13 }}>{hourPart}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#666",
            fontSize: 12,
          }}
        >
          {truncatedContent}
        </Text>

        <AssignInteractionButton onPress={handleAssignInteraction} />
      </View>
    </AnimatedPressable>
  );
}
