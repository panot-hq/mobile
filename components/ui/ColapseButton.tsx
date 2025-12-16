import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ColapseButtonProps {
  setIsListExpanded: (isExpanded: boolean) => void;
}

export default function ColapseButton({
  setIsListExpanded,
}: ColapseButtonProps) {
  const { t } = useTranslation();
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={{
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        zIndex: 100,
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsListExpanded(false);
        }}
        style={{
          backgroundColor: "#111",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 30,

          elevation: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {t("interactions.collapse")}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
