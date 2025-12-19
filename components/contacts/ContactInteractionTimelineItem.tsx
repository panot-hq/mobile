import { Shimmer } from "@/components/ui/Shimmer";
import { useInteractionOverlay } from "@/contexts/InteractionOverlayContext";
import { Interaction } from "@/lib/database/database.types";
import { formatCreatedAt } from "@/lib/utils/date-formatter";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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
  const isInteractionProcessing = interaction.status === "processing";
  const isInteractionProcessed = interaction.status === "processed";

  let datePart = formatted;
  let hourPart = "";
  if (formatted.includes("at")) {
    const [date, hour] = formatted.split("at");
    datePart = date.trim();
    hourPart = hour.trim();
  } else if (formatted.includes("a las")) {
    const [date, hour] = formatted.split("a las");
    datePart = date.trim();
    hourPart = hour.trim();
  }

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
          status: interaction.status || "unprocessed",
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
            width: 2,
            borderRadius: 10,
            height: "110%",
            backgroundColor: "#E9E9E9",
          }}
        />
      </View>

      <AnimatedPressable
        ref={componentRef}
        style={[
          {
            flex: 1,
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor:
              isInteractionProcessing || isInteractionProcessed
                ? "#e9e9e9b1"
                : "#e9e9e9b1",
            backgroundColor:
              isInteractionProcessing || isInteractionProcessed
                ? "#e9e9e9b1"
                : "white",
            gap: 8,
            marginTop: isFirst ? 6 : 0,
            marginBottom: isLast ? 0 : 10,
            flexDirection: "row",
            justifyContent: "justify-left",
            alignItems: "center",
            overflow: "hidden",
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        {isInteractionProcessing && <Shimmer />}
        <Text
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 20,
          }}
          numberOfLines={1}
        >
          {hourPart}
        </Text>
        <Text
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 20,
          }}
          numberOfLines={1}
        >
          {"-"}
        </Text>
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
      </AnimatedPressable>
    </View>
  );
}
