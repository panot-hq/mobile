import { formatCreatedAt } from "@/lib/utils/dateFormatter";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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
}

export default function Interaction({
  interactionId,
  createdAt,
  rawContent,
}: InteractionProps) {
  const scale = useSharedValue(1);
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

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
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
      key={interactionId}
      style={[
        {
          padding: 20,
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
