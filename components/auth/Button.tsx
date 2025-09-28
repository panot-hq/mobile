import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  width?: number;
  height?: number;
  iconDimensions?: number;
  iconColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  orientation?: "right" | "left";
}

export default function AuthButton({
  title,
  onPress,
  variant = "primary",
  width = 203,
  height = 82,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      duration: 150,
      dampingRatio: 0.8,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      duration: 150,
      dampingRatio: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";

  return (
    <AnimatedPressable
      style={[
        {
          borderRadius: 42,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          backgroundColor: isPrimary ? "black" : "#E9E9E9",
          width,
          height,
        },
        animatedStyle,
        ...(isPrimary
          ? [
              {
                shadowColor: "#000",
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 5,
              },
            ]
          : []),
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Text
        style={[
          {
            fontFamily: "System",
            fontWeight: "300",
            color: isPrimary ? "white" : "#696969",
            fontSize: isPrimary ? 23 : 21,
          },
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

export function EmailButton({
  title,
  onPress,
  width = 334,
  height = 45,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      duration: 150,
      dampingRatio: 0.8,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      duration: 150,
      dampingRatio: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        {
          borderRadius: 13,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#E9E9E9",
          width,
          height,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Text
        style={[
          {
            fontFamily: "System",
            fontWeight: "500",
            color: "#696969",
            fontSize: 17,
          },
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

export function ArrowButton({
  onPress,
  backgroundColor = "black",
  iconDimensions = 28,
  iconColor = "white",
  borderRadius = 13,
  width,
  height,
  orientation = "left",
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      duration: 150,
      dampingRatio: 0.8,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      duration: 150,
      dampingRatio: 0.8,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        {
          borderRadius,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          backgroundColor,
          width,
          height,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Feather
        name={orientation === "right" ? "arrow-right" : "arrow-left"}
        size={iconDimensions}
        color={iconColor}
      />
    </AnimatedPressable>
  );
}
