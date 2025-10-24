import { useInteractionOverlay } from "@/contexts/InteractionOverlayContext";
import { Interaction } from "@/lib/database/database.types";
import { useInteractions } from "@/lib/hooks/useLegendState";
import { formatCreatedAt } from "@/lib/utils/dateFormatter";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef } from "react";
import { ActionSheetIOS, Alert, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ContactInteractionItemProps {
  interaction: Interaction;
}

export default function ContactInteractionItem({
  interaction,
}: ContactInteractionItemProps) {
  const scale = useSharedValue(1);
  const { showOverlay } = useInteractionOverlay();
  const { deleteInteraction } = useInteractions();
  const componentRef = useRef<View>(null);
  const formatted = formatCreatedAt(interaction.created_at);

  let datePart = formatted;
  let hourPart = "";
  if (formatted.includes("at")) {
    const [date, hour] = formatted.split("at");
    datePart = date.trim();
    hourPart = hour.trim();
  }

  const truncatedContent =
    interaction.raw_content.length > 30
      ? interaction.raw_content.substring(0, 30) + "..."
      : interaction.raw_content;

  const handleDeleteInteraction = (callback?: () => void) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Delete Interaction"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "Delete Interaction",
        message:
          "Are you sure you want to delete this interaction? This action cannot be undone.",
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            // Eliminar con Legend State (local-first, soft delete)
            deleteInteraction(interaction.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (callback) {
              setTimeout(() => {
                callback();
              }, 400);
            }
          } catch (error) {
            console.error("Error deleting interaction:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "Could not delete the interaction");
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
            id: interaction.id,
            createdAt: interaction.created_at,
            rawContent: interaction.raw_content,
            datePart,
            hourPart,
            initialLayout: { x, y, width, height },
          },
          [
            {
              label: "VIEW",
              onPress: () => {
                router.push(`/(interactions)/${interaction.id}`);
              },
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
    router.push(`/(interactions)/${interaction.id}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      ref={componentRef}
      style={[
        {
          padding: 20,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "white",
          gap: 10,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
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
      <Text
        style={{
          color: "#666",
          fontSize: 12,
        }}
      >
        {truncatedContent}
      </Text>
    </AnimatedPressable>
  );
}
