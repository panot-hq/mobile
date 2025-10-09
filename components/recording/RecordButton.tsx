import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ButtonPropsRecord {
  onPress: () => void;
  isRecording: boolean;
  volume?: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedFontAwesome = Animated.createAnimatedComponent(FontAwesome);

export default function RecordButton({
  onPress,
  isRecording,
  volume = 0,
  disabled = false,
}: ButtonPropsRecord) {
  const scale = useSharedValue(1);
  const iconSize = useSharedValue(24);
  const colorProgress = useSharedValue(0);
  const button_scale = useSharedValue(155);
  const volumeScale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    iconSize.value = withSpring(isRecording ? 130 : 80);
    button_scale.value = withSpring(isRecording ? 200 : 155);
    colorProgress.value = withTiming(isRecording ? 1 : 0);
  }, [isRecording]);

  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 300 });
  }, [disabled]);

  useEffect(() => {
    if (isRecording) {
      const normalizedVolume = Math.min(Math.max(volume, 0), 1);
      const targetScale = 1 + normalizedVolume * 0.1;
      volumeScale.value = withSpring(targetScale, {
        stiffness: 300,
        damping: 100,
      });
    }
  }, [volume, isRecording]);

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      duration: 150,
      dampingRatio: 0.8,
    });
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      duration: 150,
      dampingRatio: 0.8,
    });

    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    width: button_scale.value,
    height: button_scale.value,
    borderRadius: button_scale.value / 3.5,
    opacity: opacity.value,
  }));

  const circleAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 1],
      ["#000", "#FF5117"]
    );

    return {
      color,
      fontSize: iconSize.value,
      transform: [{ scale: volumeScale.value }],
    };
  });

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      style={[
        {
          backgroundColor: "#E9E9E9",
          justifyContent: "center",
          alignItems: "center",
        },
        buttonAnimatedStyle,
        animatedStyle,
      ]}
    >
      <AnimatedFontAwesome name="circle" style={circleAnimatedStyle} />
    </AnimatedPressable>
  );
}
