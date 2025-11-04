import { ArrowButton } from "@/components/ui/Button";
import React, { useEffect } from "react";
import { ActivityIndicator, Dimensions, Keyboard, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface KeyboardArrowButtonProps {
  onPress: () => void;
  isEnabled: boolean;
  isLoading?: boolean;
  iconDimensions?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
}

export default function KeyboardArrowButton({
  onPress,
  isEnabled,
  isLoading = false,
  iconDimensions = 28,
  width = 111,
  height = 66,
  borderRadius = 41,
}: KeyboardArrowButtonProps) {
  const screenHeight = Dimensions.get("window").height;
  const keyboardViewPosition = useSharedValue(screenHeight - 84);

  const willChange = (e: any) => {
    const keyboardY = e.endCoordinates.screenY;

    keyboardViewPosition.value = withSpring(keyboardY - 84);
  };

  const hideKeyboardView = () => {
    keyboardViewPosition.value = withSpring(screenHeight - 100, {
      damping: 15,
      stiffness: 120,
      mass: 1,
    });
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
    top: keyboardViewPosition.value,
  }));

  const backgroundColor = isEnabled && !isLoading ? "white" : "#666666";

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
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          paddingRight: 24,
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
        <ArrowButton
          onPress={() => {
            if (isEnabled && !isLoading) {
              onPress();
            }
          }}
          iconDimensions={iconDimensions}
          width={width}
          height={height}
          iconColor="black"
          backgroundColor={backgroundColor}
          borderRadius={borderRadius}
          orientation="right"
        />
      )}
    </Animated.View>
  );
}
