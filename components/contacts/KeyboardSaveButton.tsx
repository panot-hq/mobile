import BaseButton from "@/components/ui/BaseButton";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface KeyboardSaveButtonProps {
  onPress: () => void;
  isEnabled: boolean;
  isLoading?: boolean;
  width?: number;
  height?: number;
  borderRadius?: number;
}

export default function KeyboardSaveButton({
  onPress,
  isEnabled,
  isLoading = false,
  width = 160,
  height = 66,
  borderRadius = 24,
}: KeyboardSaveButtonProps) {
  const screenHeight = Dimensions.get("window").height;
  const keyboardViewPosition = useSharedValue(screenHeight - 84);

  const willChange = (e: any) => {
    const keyboardY = e.endCoordinates.screenY;

    keyboardViewPosition.value = withSpring(keyboardY - 84);
  };

  const hideKeyboardView = () => {
    keyboardViewPosition.value = withSpring(screenHeight - 100);
  };

  useEffect(() => {
    const willChangeSub = Keyboard.addListener(
      "keyboardWillChangeFrame",
      (event: any) => willChange(event)
    );

    const willHideSub = Keyboard.addListener("keyboardWillHide", () =>
      hideKeyboardView()
    );

    return () => {
      willChangeSub.remove();
      willHideSub.remove();
    };
  }, []);

  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    top: keyboardViewPosition.value - 80,
  }));

  const backgroundColor = isEnabled && !isLoading ? "black" : "#f1f1f1";
  const textColor = isEnabled && !isLoading ? "white" : "#999999";

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          height: 60,
          elevation: 5,
          zIndex: 1000,
          paddingHorizontal: 24,
          paddingLeft: 25,
          alignItems: "flex-end",
        },
        keyboardAnimatedStyle,
      ]}
    >
      {isLoading ? (
        <View
          style={{
            width,
            height,
            backgroundColor: "#666666",
            borderRadius,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color="black" size="small" />
        </View>
      ) : (
        <BaseButton
          onPress={() => {
            if (isEnabled && !isLoading) {
              onPress();
            }
          }}
          width={width}
          height={height}
          backgroundColor={backgroundColor}
          borderRadius={borderRadius}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: textColor }}>
            Save
          </Text>
        </BaseButton>
      )}
    </Animated.View>
  );
}
