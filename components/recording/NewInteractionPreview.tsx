import FadingTranscript from "@/components/recording/FadingTranscript";
import Badge from "@/components/ui/Badge";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface NewInteractionProps {
  isRecording: boolean;
  onCancel: () => void;
  onAccept?: (transcript: string) => void;
  onReject?: () => void;
  showButtons?: boolean;
}

export default function NewInteraction({
  isRecording,
  onCancel,
  onAccept,
  onReject,
  showButtons = false,
}: NewInteractionProps) {
  const [transcript, setTranscript] = useState("");
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const buttonsOpacity = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onAccept) {
      onAccept(transcript);
    }

    onCancel();
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onReject) {
      onReject();
    }
    onCancel();
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
              <Badge title="recording    ●" color="#999" textColor="#fff" />
            </View>
          )}
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
              />
            </View>
          </ScrollView>
        </View>

        {showButtons && (
          <Animated.View
            style={[
              buttonsAnimatedStyle,
              {
                flexDirection: "row",
                marginTop: 80,
                gap: 12,
                height: 50,
              },
            ]}
          >
            <Pressable
              onPress={handleReject}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderRadius: 20,
                backgroundColor: "#F5F5F5",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#666",
                }}
              >
                Rechazar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleAccept}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 20,
                backgroundColor: "#000",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#FFFFFF",
                }}
              >
                Aceptar
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
