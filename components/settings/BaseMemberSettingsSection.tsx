import EnhanceUnlockedSvg from "@/assets/images/enhance-unlocked.svg";
import UnlockEnhanceSvg from "@/assets/images/unlock-enhance.svg";
import BaseButton from "@/components/ui/BaseButton";
import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface BaseMemberSettingsSectionProps {
  isSubscribed: boolean;
  setIsSubscribed: (isSubscribed: boolean) => void;
}

export default function BaseMemberSettingsSection({
  isSubscribed,
  setIsSubscribed,
}: BaseMemberSettingsSectionProps) {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSubscribePress = () => {
    router.push("/(auth)/(paywall)/paywall");
  };

  if (isSubscribed) {
    return (
      <View
        style={{
          borderRadius: 20, overflow: "hidden", height: 280
        }}
      >
        <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 20 }, animatedStyle]}>
          <EnhanceUnlockedSvg
            width={screenWidth - 48}
            height={240}
            preserveAspectRatio="none"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ borderRadius: 20, overflow: "hidden", height: 280 }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
          },
          animatedStyle,
        ]}
      >
        <UnlockEnhanceSvg
          width={screenWidth - 40}
          height={240}
          preserveAspectRatio="none"
        />
      </Animated.View>

      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 50,
          alignItems: "center",
        }}
      >
        <BaseButton
          onPress={handleSubscribePress}
          backgroundColor="#000000ff"
          borderRadius={50}
          height={45}
          width={300}
        >
          <Text style={{ fontSize: 16, fontWeight: "400", color: "#ffffffff" }}>
            {t("account.subscription_button")}
          </Text>
        </BaseButton>
      </View>
    </View>
  );
}
