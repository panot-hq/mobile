import ArrowButton from "@/components/auth/buttons/ArrowButton";
import BaseButton from "@/components/ui/BaseButton";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useAuth } from "@/contexts/AuthContext";
import handleFeedbackSubmit from "@/lib/utils/handle-feedback-submit";

type FeedbackType = "bug" | "feature";

export default function Feedback() {
  const { t } = useTranslation();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const screenHeight = Dimensions.get("window").height;
  const keyboardViewPosition = useSharedValue(screenHeight - 84);

  const switcherPosition = useSharedValue(0);

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

  useEffect(() => {
    switcherPosition.value = withSpring(feedbackType === "bug" ? 0 : 1);
  }, [feedbackType]);

  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    top: keyboardViewPosition.value - 20,
  }));

  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 4;
  const buttonWidth = (screenWidth - 48 - containerPadding * 2) / 2;
  const buttonHeight = 44;

  const switcherAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: buttonWidth,
      height: buttonHeight,
      transform: [
        {
          translateX: switcherPosition.value * (buttonWidth + containerPadding),
        },
      ],
    };
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (isAnonymous) {
      await handleFeedbackSubmit(feedbackType, feedbackText, isAnonymous);
    } else {
      await handleFeedbackSubmit(
        feedbackType,
        feedbackText,
        isAnonymous,
        user?.email
      );
    }
    setIsSubmitting(false);
    router.navigate("/(feedback)/submitted");
  };

  const isFormValid = feedbackText.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000000ff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          position: "absolute",
          top: 55,
          left: 12,
          zIndex: 1,
        }}
      >
        <ArrowButton
          onPress={() => router.back()}
          iconDimensions={28}
          iconColor="white"
          backgroundColor="#000000ff"
          borderRadius={13}
          settings={true}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 130,
          paddingBottom: 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: "200",
            color: "white",
            marginBottom: 32,
          }}
        >
          {t("feedback.title")}
        </Text>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#1a1a1a",
            borderRadius: 17,
            padding: 4,
            marginBottom: 24,
            position: "relative",
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 4,
                left: 4,
                backgroundColor: "#ffffff",
                borderRadius: 17,
              },
              switcherAnimatedStyle,
            ]}
          />

          <Pressable
            onPress={() => setFeedbackType("bug")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                color: feedbackType === "bug" ? "#000000" : "#999999",
              }}
            >
              {t("feedback.bug_report")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFeedbackType("feature")}
            style={{
              flex: 1,
              paddingLeft: 13,
              paddingTop: 13,
              borderRadius: 8,
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                color: feedbackType === "feature" ? "#000000" : "#999999",
              }}
            >
              {t("feedback.feature_request")}
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: "white",
            minHeight: 200,
            textAlignVertical: "top",
          }}
          value={feedbackText}
          onChangeText={setFeedbackText}
          placeholder={
            feedbackType === "bug"
              ? t("feedback.bug_placeholder")
              : t("feedback.feature_placeholder")
          }
          placeholderTextColor="#666666"
          multiline
          autoCapitalize="sentences"
          autoCorrect={true}
          spellCheck={true}
        />
      </ScrollView>

      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            elevation: 5,
            zIndex: 1000,
            paddingHorizontal: 24,
          },
          keyboardAnimatedStyle,
        ]}
      >
        <Pressable
          onPress={() => setIsAnonymous(!isAnonymous)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: isAnonymous ? "#ffffff" : "#666666",
              backgroundColor: isAnonymous ? "#ffffff" : "transparent",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isAnonymous && (
              <Text
                style={{ color: "#000000", fontSize: 16, fontWeight: "700" }}
              >
                ✓
              </Text>
            )}
          </View>
          <Text style={{ color: "#ffffff", fontSize: 14 }}>
            {t("feedback.submit_anonymously")}
          </Text>
        </Pressable>

        {isSubmitting ? (
          <View
            style={{
              width: "100%",
              height: 45,
              backgroundColor: "#666666",
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator color="white" size="small" />
          </View>
        ) : (
          <BaseButton
            onPress={() => {
              if (isFormValid && !isSubmitting) {
                handleSubmit();
              }
            }}
            width={Dimensions.get("window").width - 48}
            height={45}
            backgroundColor={isFormValid ? "white" : "#333333"}
            borderRadius={24}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isFormValid ? "#000000" : "#666666",
              }}
            >
              {t("feedback.submit")}
            </Text>
          </BaseButton>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
