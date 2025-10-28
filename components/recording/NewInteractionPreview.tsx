import FadingTranscript from "@/components/recording/FadingTranscript";
import Badge from "@/components/ui/Badge";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, Text, TextInput, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import BaseButton from "../ui/BaseButton";

export interface ActionButton {
  label: string;
  onPress: (transcript: string) => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: keyof typeof MaterialIcons.glyphMap;
}

interface NewInteractionProps {
  isRecording: boolean;
  onCancel: () => void;
  showButtons?: boolean;
  previousTranscript?: string;
  onTranscriptUpdate?: (transcript: string) => void;
  actions?: ActionButton[];
}

export default function NewInteraction({
  isRecording,
  onCancel,
  showButtons = false,
  previousTranscript = "",
  onTranscriptUpdate: onExternalTranscriptUpdate,
  actions = [],
}: NewInteractionProps) {
  const [transcript, setTranscript] = useState("");
  const [editableText, setEditableText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const buttonsOpacity = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  useEffect(() => {
    if (showButtons) {
      buttonsOpacity.value = withTiming(1, { duration: 300 });
    } else {
      buttonsOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [showButtons]);

  useEffect(() => {
    if (showButtons && !isEditing) {
      setEditableText(transcript);
    }
  }, [showButtons, transcript, isEditing]);

  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);

    if (onExternalTranscriptUpdate) {
      onExternalTranscriptUpdate(newTranscript);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTextInputBlur = () => {
    setIsEditing(false);
    setTranscript(editableText);
    if (onExternalTranscriptUpdate) {
      onExternalTranscriptUpdate(editableText);
    }
  };

  const handleTextInputFocus = () => {
    setIsEditing(true);
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    textInputRef.current?.blur();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleActionPress = (action: ActionButton) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress(transcript);
  };

  const getButtonStyle = (
    variant: "primary" | "secondary" | "outline" = "secondary"
  ) => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "#000",
          borderColor: "#000",
        };
      case "secondary":
        return {
          backgroundColor: "#F5F5F5",
          borderColor: "#F5F5F5",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: "#ddd",
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: "#F5F5F5",
          borderColor: "#F5F5F5",
        };
    }
  };

  const getTextStyle = (
    variant: "primary" | "secondary" | "outline" = "secondary"
  ) => {
    switch (variant) {
      case "primary":
        return { color: "#FFFFFF" };
      case "secondary":
        return { color: "#666" };
      case "outline":
        return { color: "#000" };
      default:
        return { color: "#666" };
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={{
        position: "absolute",
        top: 70,
        alignSelf: "center",
        width: "87%",
        height: 220,
        zIndex: 2000,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
          height: 80,
          gap: 12,
        }}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 22,
            backgroundColor: "#E9E9E9",
            borderRadius: 25,
            elevation: 8,

            justifyContent: "center",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontSize: 22, color: "#000", fontWeight: "400" }}>
            Today{", "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {showButtons && actions.length > 0 && (
          <Animated.View
            style={[
              buttonsAnimatedStyle,
              {
                flexDirection: "row",
                gap: 12,
              },
            ]}
          >
            {actions.map((action, index) => {
              const buttonStyle = getButtonStyle(action.variant);
              const textStyle = getTextStyle(action.variant);

              return (
                <BaseButton
                  key={`${action.label}-${index}`}
                  onPress={() => handleActionPress(action)}
                  style={{
                    width: 65,
                    height: 65,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 25,
                    elevation: 8,
                    ...buttonStyle,
                  }}
                >
                  {action.icon ? (
                    <MaterialIcons
                      name={action.icon}
                      size={24}
                      color={textStyle.color}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        ...textStyle,
                      }}
                    >
                      {action.label}
                    </Text>
                  )}
                </BaseButton>
              );
            })}
          </Animated.View>
        )}
      </View>

      <Animated.View
        style={[
          animatedStyle,
          {
            width: "100%",
            height: "100%",
            backgroundColor: "#E9E9E9",
            borderRadius: 29,
            elevation: 8,
          },
        ]}
      >
        <View>
          {isRecording && (
            <View style={{ padding: 24, height: 40 }}>
              <Badge title="●    recording" color="#999" textColor="#fff" />
            </View>
          )}
          {showButtons ? (
            <ScrollView
              style={{
                marginTop: 20,
                height: 180,
                paddingHorizontal: 20,
              }}
              contentContainerStyle={{
                paddingBottom: 15,
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                ref={textInputRef}
                multiline
                value={editableText}
                onChangeText={setEditableText}
                onBlur={handleTextInputBlur}
                onFocus={handleTextInputFocus}
                enterKeyHint="enter"
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 22,
                  minHeight: 140,
                  textAlignVertical: "top",
                  paddingTop: 10,
                  color: "#000",
                }}
                placeholder="Escribe aquí..."
                placeholderTextColor="#999"
              />
            </ScrollView>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={{
                marginTop: isRecording ? 10 : 20,
                height: 140,
                paddingHorizontal: 20,
              }}
              contentContainerStyle={{
                paddingBottom: 15,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  minHeight: 60,
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                <FadingTranscript
                  isRecording={isRecording}
                  onTranscriptUpdate={handleTranscriptUpdate}
                  previousTranscript={previousTranscript}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}
