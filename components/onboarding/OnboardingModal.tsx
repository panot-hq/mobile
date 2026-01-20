import OnboardingBgSvg from "@/assets/images/onboarding-bg.svg";
import BaseButton from "@/components/ui/BaseButton";
import { useAuth } from "@/contexts/AuthContext";
import { ProfilesService } from "@/lib/database/index";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OnboardingModal({
  visible,
  onClose,
}: OnboardingModalProps) {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const userName = user?.user_metadata?.display_name?.split(" ")[0] || "";

  const handleCompleteOnboarding = async () => {
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      const response = await ProfilesService.completeOnboarding(user.id);
      if (response.data && !response.error) {
        await refreshProfile();
        onClose();
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={30}
        tint="light"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: width * 0.9,
            height: height * 0.6,
            maxWidth: 400,
            backgroundColor: "#fff",
            borderRadius: 25,
            overflow: "hidden",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              zIndex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <OnboardingBgSvg
              width={width * 1.2}
              height={height * 0.6}
            />
          </View>

          <View
            style={{
              paddingHorizontal: 30,
              paddingTop: 70,
              paddingBottom: 20,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Text
              style={{
                fontSize: 40,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              {t("onboarding.welcome", { name: userName })}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "300",
                color: "#fff",
                textAlign: "left",
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              {t("onboarding.description_1")}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "300",
                color: "#fff",
                textAlign: "left",
                lineHeight: 24,
              }}
            >
              {t("onboarding.description_2")}
            </Text>
          </View>

          <View
            style={{
              marginTop: 50,
              width: "100%",
              paddingHorizontal: 30,
              paddingBottom: 30,
              zIndex: 1000,
            }}
          >
            <BaseButton
              onPress={handleCompleteOnboarding}
              backgroundColor="#fff"
              borderRadius={25}
              style={{
                width: "100%",
                paddingVertical: 16,
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "400",
                    color: "#000",
                    textAlign: "center",
                  }}
                >
                  {t("onboarding.button")}
                </Text>
              )}
            </BaseButton>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
