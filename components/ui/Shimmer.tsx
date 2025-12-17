import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const Shimmer = () => {
  const translateX = useSharedValue(-150);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(150, {
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        animatedStyle,
        { zIndex: 10, opacity: 0.8 },
      ]}
    >
      <LinearGradient
        colors={["#E9E9E9", "#FFFFFF", "#E9E9E9"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};
