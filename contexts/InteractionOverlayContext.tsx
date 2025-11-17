import BaseButton from "@/components/ui/BaseButton";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { ReactNode, createContext, useContext, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface InteractionData {
  id: string;
  createdAt: string;
  rawContent: string;
  datePart: string;
  hourPart: string;
  initialLayout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface InteractionOverlayContextType {
  showOverlay: (data: InteractionData, actions: OverlayAction[]) => void;
  hideOverlay: (callback?: () => void) => void;
}

interface OverlayAction {
  label: string;
  onPress: (hideOverlay?: () => void) => void;
  icon?: string;
  destructive?: boolean;
}

const InteractionOverlayContext = createContext<
  InteractionOverlayContextType | undefined
>(undefined);

export const useInteractionOverlay = () => {
  const context = useContext(InteractionOverlayContext);
  if (!context) {
    throw new Error(
      "useInteractionOverlay must be used within InteractionOverlayProvider"
    );
  }
  return context;
};

export const InteractionOverlayProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [interactionData, setInteractionData] =
    useState<InteractionData | null>(null);
  const [actions, setActions] = useState<OverlayAction[]>([]);
  const progress = useSharedValue(0);
  const blurOpacity = useSharedValue(0);

  const showOverlay = (
    data: InteractionData,
    overlayActions: OverlayAction[]
  ) => {
    setInteractionData(data);
    setActions(overlayActions);
    setVisible(true);
    progress.value = withSpring(1);
    blurOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  };

  const hideOverlay = (callback?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    progress.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
    blurOpacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    setTimeout(() => {
      setVisible(false);
      setInteractionData(null);
      setActions([]);
      if (callback) {
        callback();
      }
    }, 300);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    if (!interactionData?.initialLayout) return {};

    const { x, y, width, height } = interactionData.initialLayout;

    const targetWidth = SCREEN_WIDTH * 0.9;
    const targetHeight = Math.min(SCREEN_HEIGHT * 0.6, 500);
    const targetX = (SCREEN_WIDTH - targetWidth) / 2;
    const targetY = (SCREEN_HEIGHT - targetHeight - 15) / 2;

    return {
      position: "absolute",
      left: interpolate(progress.value, [0, 1], [x, targetX]),
      top: interpolate(progress.value, [0, 1], [y, targetY]),
      width: interpolate(progress.value, [0, 1], [width, targetWidth]),
      height: interpolate(progress.value, [0, 1], [height, targetHeight]),
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]),
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 20,
      backgroundColor: "white",
      gap: 15,

      elevation: 20,
    };
  });

  const contentOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
  }));

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.7, 1], [0, 0, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 0.7, 1], [20, 20, 0]),
      },
    ],
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const handleActionPress = (action: OverlayAction) => {
    if (action.destructive) {
      action.onPress(hideOverlay);
    } else {
      hideOverlay(() => {
        action.onPress();
      });
    }
  };

  const handleCardPress = () => {
    const viewDetailsAction = actions.find((action) =>
      action.label.toLowerCase().includes("view")
    );
    if (viewDetailsAction) {
      handleActionPress(viewDetailsAction);
    }
  };

  const handleOverlayPress = () => {
    hideOverlay();
  };

  return (
    <InteractionOverlayContext.Provider value={{ showOverlay, hideOverlay }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleOverlayPress}
      >
        <Pressable
          style={{
            flex: 1,
          }}
          onPress={handleOverlayPress}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
              blurAnimatedStyle,
            ]}
          >
            <BlurView
              intensity={25}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            </BlurView>
          </Animated.View>
          <AnimatedPressable
            style={cardAnimatedStyle}
            onPress={handleCardPress}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 10,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ fontSize: 13, color: "#666" }}>
                {interactionData?.datePart}
              </Text>
              <Text style={{ fontSize: 13, color: "#666" }}>
                {interactionData?.hourPart}
              </Text>
            </View>

            <Animated.View
              style={[
                {
                  flex: 1,
                  paddingVertical: 10,
                },
                contentOpacityStyle,
              ]}
            >
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: "#000",
                    lineHeight: 22,
                  }}
                >
                  {interactionData?.rawContent}
                </Text>
              </ScrollView>
            </Animated.View>
            {actions.length > 0 && (
              <Animated.View
                style={[
                  { marginTop: 10, gap: 10, flexDirection: "row" },
                  actionsAnimatedStyle,
                ]}
                onStartShouldSetResponder={() => true}
              >
                {actions.map((action, index) => {
                  const isViewDetails = action.label
                    .toLowerCase()
                    .includes("view details");
                  return (
                    <BaseButton
                      key={index}
                      onPress={() => handleActionPress(action)}
                      backgroundColor={action.destructive ? "#000" : "#f5f5f5"}
                      borderRadius={20}
                      scaleValue={0.97}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        width: "48.5%",
                        height: 60,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "400",
                          color: action.destructive ? "#fff" : "#000",
                        }}
                      >
                        {action.label}
                      </Text>
                    </BaseButton>
                  );
                })}
              </Animated.View>
            )}
          </AnimatedPressable>
        </Pressable>
      </Modal>
    </InteractionOverlayContext.Provider>
  );
};
