import { useInteractionOverlay } from "@/contexts/InteractionOverlayContext";
import { formatCreatedAt } from "@/lib/utils/dateFormatter";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Pressable, Text, View } from "react-native";
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
  status: string;
}

export default function Interaction({
  interactionId,
  createdAt,
  rawContent,
  status,
}: InteractionProps) {
  const scale = useSharedValue(1);
  const { showOverlay } = useInteractionOverlay();
  const componentRef = useRef<View>(null);
  const formatted = formatCreatedAt(createdAt);

  let datePart = formatted;
  let hourPart = "";
  if (formatted.includes("at")) {
    const [date, hour] = formatted.split("at");
    datePart = date.trim();
    hourPart = hour.trim();
  }
  if (formatted.includes("a las")) {
    const [date, hour] = formatted.split("a las");
    datePart = date.trim();
    hourPart = hour.trim();
  }

  const truncatedContent =
    rawContent.length > 20 ? rawContent.substring(0, 30) + "..." : rawContent;

  const handleAssignInteraction = () => {
    router.push(`/(interactions)/assign?interactionId=${interactionId}`);
  };

  const openOverlay = () => {
    if (componentRef.current) {
      componentRef.current.measureInWindow((x, y, width, height) => {
        showOverlay({
          id: interactionId,
          createdAt,
          rawContent,
          datePart,
          hourPart,
          initialLayout: { x, y, width, height },
          status,
        });
      });
    }
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    openOverlay();
  };

  const handlePressIn = () => {
    scale.value = withSpring(1.02);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openOverlay();
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

        <AssignInteractionButton
          onPress={handleAssignInteraction}
          stopPropagation
        />
      </View>
    </AnimatedPressable>
  );
}
