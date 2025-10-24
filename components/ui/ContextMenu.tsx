import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import BaseButton from "./BaseButton";

interface ContextMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  iconColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  iconDimensions?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export default function ContextMenu({
  onEdit,
  onDelete,
  iconColor = "#999",
  backgroundColor = "white",
  borderRadius = 13,
  borderWidth = 1,
  borderColor = "#ddd",
  iconDimensions = 20,
}: ContextMenuProps) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<View>(null);

  const menuOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  const handleMenuPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({
          x: -123,
          y: 48,
        });

        menuOpacity.value = 0;
        backdropOpacity.value = 0;

        setIsMenuVisible(true);

        setTimeout(() => {
          menuOpacity.value = withTiming(1, { duration: 200 });
          backdropOpacity.value = withTiming(1, { duration: 200 });
          iconRotation.value = withTiming(45, { duration: 200 });
        }, 10);
      });
    }
  };

  const handleEdit = () => {
    hideMenu();
    onEdit();
  };

  const handleDelete = () => {
    hideMenu();
    onDelete();
  };

  const hideMenu = () => {
    menuOpacity.value = withTiming(0, { duration: 150 });
    backdropOpacity.value = withTiming(0, { duration: 150 });
    iconRotation.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setIsMenuVisible)(false);
    });
  };

  const handleBackdropPress = () => {
    hideMenu();
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  return (
    <>
      <View ref={buttonRef}>
        <BaseButton
          onPress={handleMenuPress}
          backgroundColor={backgroundColor}
          borderRadius={borderRadius}
          borderWidth={borderWidth}
          borderColor={borderColor}
          style={{
            padding: 8,
          }}
        >
          <Animated.View style={iconAnimatedStyle}>
            <AntDesign name="plus" size={iconDimensions} color={iconColor} />
          </Animated.View>
        </BaseButton>
      </View>

      {isMenuVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            elevation: 9999,
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              backdropAnimatedStyle,
            ]}
          >
            <Pressable style={{ flex: 1 }} onPress={handleBackdropPress} />
          </Animated.View>

          <Animated.View
            style={[
              {
                position: "absolute",
                left: menuPosition.x,
                top: menuPosition.y,
                paddingVertical: 8,
                minWidth: 160,
                elevation: 10,
                zIndex: 10000,
                gap: 10,
                borderRadius: 12,
                opacity: 1,
                transform: [{ scale: 1 }],
                alignItems: "flex-end",
              },
              menuAnimatedStyle,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <BaseButton
              onPress={handleEdit}
              backgroundColor="transparent"
              style={{
                paddingVertical: 12,

                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#ddd",
                backgroundColor: "#fff",
                width: 120,
                height: 50,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                edit
              </Text>
            </BaseButton>

            <BaseButton
              onPress={handleDelete}
              backgroundColor="transparent"
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
                width: 120,
                height: 50,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "white",
                  fontWeight: "500",
                }}
              >
                delete
              </Text>
            </BaseButton>
          </Animated.View>
        </View>
      )}
    </>
  );
}
