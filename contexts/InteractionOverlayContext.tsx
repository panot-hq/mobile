import BaseButton from "@/components/ui/BaseButton";
import { useAuth } from "@/contexts/AuthContext";
import { ProcessQueueService } from "@/lib/database/services/process-queue";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  status: string;
}

interface InteractionOverlayContextType {
  showOverlay: (data: InteractionData) => void;
  hideOverlay: (callback?: () => void) => void;
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
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentValue, setContentValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoProcessOnAssign, setAutoProcessOnAssign] = useState(false);
  const progress = useSharedValue(0);
  const blurOpacity = useSharedValue(0);

  const { user } = useAuth();
  const { getInteraction, updateInteraction, deleteInteraction } =
    useInteractions();
  const { getContact } = useContacts();
  const interaction = interactionData
    ? getInteraction(interactionData.id)
    : null;
  const contact = interaction?.contact_id
    ? getContact(interaction.contact_id)
    : null;

  const isInteractionAssigned =
    interaction !== null && interaction?.contact_id !== null;
  const isInteractionProcessed = interaction !== null && interaction?.processed;

  useEffect(() => {
    if (interaction) {
      setContentValue(interaction.raw_content || "");
      if (interaction.status == "processing") {
        setIsProcessing(true);
      } else {
        setIsProcessing(false);
      }
    }
  }, [interaction]);

  const showOverlay = (data: InteractionData) => {
    setInteractionData(data);
    setContentValue(data.rawContent);
    setIsEditingContent(false);
    setAutoProcessOnAssign(true);
    setVisible(true);
    progress.value = withSpring(1);
    blurOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  };

  const hideOverlay = (callback?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    setIsEditingContent(false);
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
      if (callback) {
        callback();
      }
    }, 300);
  };

  const handleContentSave = async () => {
    if (interaction && contentValue !== interaction.raw_content) {
      try {
        updateInteraction(interaction.id, { raw_content: contentValue });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating interaction:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingContent(false);
  };

  const handleDeleteInteraction = () => {
    if (!interaction) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Eliminar Interacción"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "Eliminar Interacción",
        message:
          "¿Estás seguro de que quieres eliminar esta interacción? Esta acción no se puede deshacer.",
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            deleteInteraction(interaction.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            hideOverlay();
          } catch (error) {
            console.error("Error deleting interaction:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "No se pudo eliminar la interacción");
          }
        }
      }
    );
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    if (!interactionData?.initialLayout) return {};

    const { x, y, width, height } = interactionData.initialLayout;

    const targetWidth = SCREEN_WIDTH * 0.9;
    const targetHeight = SCREEN_HEIGHT * 0.55;
    const targetX = (SCREEN_WIDTH - targetWidth) / 2;
    const targetY = (SCREEN_HEIGHT - targetHeight) / 2;

    return {
      position: "absolute",
      left: interpolate(progress.value, [0, 1], [x, targetX]),
      top: interpolate(progress.value, [0, 1], [y, targetY]),
      width: interpolate(progress.value, [0, 1], [width, targetWidth]),
      height: interpolate(progress.value, [0, 1], [height, targetHeight]),
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]),
      backgroundColor: "white",
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "#ddd",
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

  const handleOverlayPress = () => {
    if (!isEditingContent) {
      hideOverlay();
    }
  };

  const handleContentPress = () => {
    if (!isEditingContent && !isInteractionProcessed) {
      setIsEditingContent(true);
    } else {
      Keyboard.dismiss();
    }
  };

  const handleAssignPress = () => {
    hideOverlay(() => {
      router.push(
        `/(interactions)/assign?interactionId=${interactionData?.id}&autoProcess=${autoProcessOnAssign}`
      );
    });
  };

  const handleProcessInteraction = async () => {
    if (!interaction || !contact || isProcessing) return;

    setIsProcessing(true);

    try {
      await ProcessQueueService.enqueue({
        userId: user!.id,
        contactId: contact.id,
        jobType: "INTERACTION_TRANSCRIPT",
        payload: {
          transcript: interaction.raw_content,
          interaction_id: interaction.id,
          contact_name: `${contact.first_name || ""} ${
            contact.last_name || ""
          }`.trim(),
        },
      });
      updateInteraction(interaction.id, {
        status: "processing",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      setIsProcessing(false);
      console.error("Error enqueuing interaction processing:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {interactionData?.createdAt && (
              <Pressable
                onPress={() => Keyboard.dismiss()}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 25,
                  paddingHorizontal: 25,
                  paddingBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                  }}
                >
                  {interactionData.datePart}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                  }}
                >
                  {interactionData.hourPart}
                </Text>
              </Pressable>
            )}

            {isInteractionAssigned && (
              <Pressable
                onPress={() => Keyboard.dismiss()}
                style={{
                  backgroundColor: "rgba(245, 245, 245, 0.8)",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginHorizontal: 20,
                  marginBottom: 30,
                  marginTop: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#666",
                        marginBottom: 4,
                        fontWeight: "300",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Associated contact
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#000",
                        fontWeight: "500",
                      }}
                    >
                      {contact
                        ? `${contact.first_name} ${contact.last_name}`
                        : "Unassigned"}
                    </Text>
                  </View>
                  {!isInteractionProcessed && !isProcessing && (
                    <BaseButton
                      onPress={handleAssignPress}
                      backgroundColor="#fff"
                      borderRadius={12}
                      scaleValue={0.95}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: "#ddd",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#000",
                        }}
                      >
                        REASSIGN
                      </Text>
                    </BaseButton>
                  )}
                </View>
              </Pressable>
            )}

            <Animated.View
              style={[
                {
                  flex: 1,
                  paddingHorizontal: 25,
                },
                contentOpacityStyle,
              ]}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  if (isEditingContent) {
                    Keyboard.dismiss();
                  }
                }}
              >
                <ScrollView
                  style={{ flex: 1, marginTop: 15 }}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                >
                  <Pressable onPress={handleContentPress}>
                    {isEditingContent ? (
                      <TextInput
                        style={{
                          fontSize: 15,
                          color: "#000",
                          lineHeight: 22,
                          fontWeight: "400",
                          minHeight: 120,
                        }}
                        value={contentValue}
                        onChangeText={setContentValue}
                        onBlur={handleContentSave}
                        placeholder="Interaction content"
                        multiline
                        autoFocus
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 15,
                          color: "#000",
                          lineHeight: 22,
                        }}
                      >
                        {contentValue}
                      </Text>
                    )}
                  </Pressable>
                </ScrollView>
              </Pressable>
            </Animated.View>

            {!(isInteractionAssigned && isInteractionProcessed) && (
              <Animated.View
                style={[
                  {
                    marginTop: 15,
                    marginHorizontal: 20,
                    marginBottom: 20,
                    gap: 10,
                    flexDirection: "row",
                  },
                  actionsAnimatedStyle,
                ]}
                onStartShouldSetResponder={() => true}
              >
                {!isInteractionAssigned && (
                  <BaseButton
                    onPress={handleAssignPress}
                    backgroundColor="#f5f5f5"
                    borderRadius={20}
                    scaleValue={0.97}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      width: "48.5%",
                      height: 55,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "400",
                        color: "#000",
                      }}
                    >
                      ASSIGN
                    </Text>
                  </BaseButton>
                )}

                <BaseButton
                  onPress={handleDeleteInteraction}
                  backgroundColor="#000"
                  borderRadius={20}
                  scaleValue={0.97}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    width: "48.5%",
                    height: 55,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "400",
                      color: "#fff",
                    }}
                  >
                    DELETE
                  </Text>
                </BaseButton>
                {isInteractionAssigned && !isInteractionProcessed && (
                  <BaseButton
                    onPress={handleProcessInteraction}
                    backgroundColor="#ffffffff"
                    borderColor={"#000000ff"}
                    borderWidth={1}
                    borderRadius={20}
                    scaleValue={0.97}
                    disabled={isProcessing}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      width: isInteractionAssigned ? "48.5%" : "100%",

                      height: 55,
                      opacity: isProcessing ? 0.7 : 1,
                    }}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#000000ff" />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "400",
                          color: "#000000ff",
                        }}
                      >
                        PROCESS
                      </Text>
                    )}
                  </BaseButton>
                )}
              </Animated.View>
            )}
          </AnimatedPressable>
        </Pressable>
      </Modal>
    </InteractionOverlayContext.Provider>
  );
};
