import BaseButton from "@/components/ui/BaseButton";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function CongratsScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: "#000000ff" }}>
      <View
        style={{
          alignItems: "center",
          marginTop: 300,
          width: "100%",
          paddingHorizontal: 50,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "300",
            color: "white",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {t("paywall.congrats_title")}
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "200",
            color: "#ddd",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          {t("paywall.congrats_subtitle")}
        </Text>

      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", padding: 40 }}>
        <BaseButton
          backgroundColor="#ffffffff"
          borderRadius={20}
          borderWidth={0}
          borderColor="transparent"
          onPress={() => router.replace("/(tabs)/present")}
          height={50}
        >
          <Text style={{ color: "black", fontWeight: "600", fontSize: 16 }}>
            {t("paywall.congrats_button")}
          </Text>
        </BaseButton>
      </View>
    </View>
  );
}