import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedTabBarCircleProps {
  isFocused: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function AnimatedTabBarCircle({
  isFocused,
  onPress,
  disabled = false,
}: AnimatedTabBarCircleProps) {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.2 : 1);

    colorProgress.value = withSpring(isFocused ? 1 : 0);
  }, [isFocused, scale, colorProgress]);

  useEffect(() => {
    opacity.value = withSpring(disabled ? 0.3 : 1);
  }, [disabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 1],
      ["#A7A7A7", "#000"]
    );

    return {
      transform: [{ scale: scale.value }],
      color,
      opacity: opacity.value,
    };
  });

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.Text style={animatedStyle}>
        <FontAwesome name="circle" size={11} />
      </Animated.Text>
    </Pressable>
  );
}

interface TabBarProps {
  navigationState: {
    index: number;
    routes: Array<{ key: string; title: string }>;
  };
  jumpTo: (key: string) => void;
  disabled?: boolean;
  shouldBlur?: boolean;
  isListExpanded?: boolean;
}

export default function TabBar({
  navigationState,
  jumpTo,
  disabled = false,
  shouldBlur = false,
  isListExpanded = false,
}: TabBarProps) {
  const tabBarOpacity = useSharedValue(1);

  useEffect(() => {
    tabBarOpacity.value = withSpring(isListExpanded ? 0 : 1);
  }, [isListExpanded, tabBarOpacity]);

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      opacity: tabBarOpacity.value,
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: shouldBlur ? "transparent" : "#EFEFEF",
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: shouldBlur ? "transparent" : "#fff",
      opacity: shouldBlur ? 0 : 1,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 90,
          left: "50%",
          transform: [{ translateX: "-50%" }],
          borderRadius: 30,
          elevation: 8,
          width: 50,
          zIndex: 1000,
        },
        animatedTabBarStyle,
        animatedContainerStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            height: 25,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            paddingHorizontal: 8,
            borderRadius: 30,
          },
          animatedBackgroundStyle,
        ]}
      >
        {navigationState.routes.map((route, index) => {
          const isFocused = navigationState.index === index;

          const onPress = () => {
            jumpTo(route.key);
          };

          return (
            <AnimatedTabBarCircle
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              disabled={disabled}
            />
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}
