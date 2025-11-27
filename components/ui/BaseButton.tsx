import * as Haptics from "expo-haptics";
import React, { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BaseButtonProps extends Omit<PressableProps, "style"> {
  onPress: () => void;
  width?: number;
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  children: ReactNode;
  style?: any;
  hapticFeedback?: Haptics.ImpactFeedbackStyle;
  scaleValue?: number;
  springConfig?: {
    duration?: number;
    dampingRatio?: number;
  };
  borderWidth?: number;
  borderColor?: string;
  stopPropagation?: boolean;
  marginTop?: number;
}

export default function BaseButton({
  onPress,
  width,
  height,
  borderRadius = 13,
  backgroundColor = "transparent",
  children,
  style,
  hapticFeedback = Haptics.ImpactFeedbackStyle.Light,
  scaleValue = 0.98,
  springConfig = { duration: 150, dampingRatio: 0.8 },
  borderWidth,
  borderColor,
  stopPropagation = false,
  marginTop,
  ...pressableProps
}: BaseButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = (e: any) => {
    if (stopPropagation && e?.stopPropagation) {
      e.stopPropagation();
    }
    Haptics.impactAsync(hapticFeedback);
    onPress();
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
          borderWidth,
          borderColor,
          marginTop,
        },
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...pressableProps}
    >
      {children}
    </AnimatedPressable>
  );
}
