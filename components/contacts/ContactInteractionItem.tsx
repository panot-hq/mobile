import { useInteractionOverlay } from "@/contexts/InteractionOverlayContext";
import { Interaction } from "@/lib/database/database.types";
import { formatCreatedAt } from "@/lib/utils/dateFormatter";
import { isProcessing } from "@/lib/utils/processingState";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Badge from "../ui/Badge";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ContactInteractionItemProps {
  interaction: Interaction;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function ContactInteractionItem({
  interaction,
  isFirst = false,
  isLast = false,
}: ContactInteractionItemProps) {
  const scale = useSharedValue(1);
  const { showOverlay } = useInteractionOverlay();
  const componentRef = useRef<View>(null);
  const formatted = formatCreatedAt(interaction.created_at);
  const [isInteractionProcessing, setIsInteractionProcessing] = useState(false);

  let datePart = formatted;
  let hourPart = "";
  if (formatted.includes("at")) {
    const [date, hour] = formatted.split("at");
    datePart = date.trim();
    hourPart = hour.trim();
  }
  const isInteractionProcessed = interaction.processed;

  useEffect(() => {
    const checkProcessing = () => {
      setIsInteractionProcessing(isProcessing(interaction.id));
    };

    checkProcessing();
    const interval = setInterval(checkProcessing, 500);

    return () => clearInterval(interval);
  }, [interaction.id]);

  const truncatedContent =
    interaction.raw_content.length > 10
      ? interaction.raw_content.substring(0, 10) + "..."
      : interaction.raw_content;

  const openOverlay = () => {
    if (componentRef.current) {
      componentRef.current.measureInWindow((x, y, width, height) => {
        showOverlay({
          id: interaction.id,
          createdAt: interaction.created_at,
          rawContent: interaction.raw_content,
          datePart,
          hourPart,
          initialLayout: { x, y, width, height },
        });
      });
    }
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    openOverlay();
  };

  const handlePressIn = () => {
    scale.value = withSpring(1.01);
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
    <View style={{ flexDirection: "row", position: "relative" }}>
      <View
        style={{
          width: 40,
          alignItems: "center",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 1.5,
            height: "100%",
            backgroundColor: "#ddd",
          }}
        />
      </View>

      <AnimatedPressable
        ref={componentRef}
        style={[
          {
            flex: 1,
            padding: 16,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            backgroundColor: "white",
            gap: 8,
            marginBottom: isLast ? 0 : 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <Text
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 20,
          }}
          numberOfLines={1}
        >
          {truncatedContent}
        </Text>
        {isInteractionProcessing ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FF5117",
              backgroundColor: "#fff",
            }}
          >
            <ActivityIndicator size="small" color="#FF5117" />
            <Text style={{ fontSize: 12, color: "#FF5117" }}>processing</Text>
          </View>
        ) : (
          <Badge
            title={isInteractionProcessed ? "processed" : "unprocessed"}
            color="#fff"
            textColor={isInteractionProcessed ? "#bbb" : "#FF5117"}
            borderColor={isInteractionProcessed ? "#ddd" : "#FF5117"}
            borderWidth={1}
            textSize={12}
          />
        )}
      </AnimatedPressable>
    </View>
  );
}
