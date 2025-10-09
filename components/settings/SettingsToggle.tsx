import React from "react";
import { Switch, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface SettingsToggleProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: string;
}

export default function SettingsToggle({
  title,
  subtitle,
  value,
  onValueChange,
  icon,
}: SettingsToggleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1);
    });
    onValueChange(!value);
  };

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#333333",
        },
        animatedStyle,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: "#FFFFFF",
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: "#CCCCCC",
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        ios_backgroundColor="#E0E0E0"
      />
    </Animated.View>
  );
}
