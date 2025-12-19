import BaseButton from "@/components/ui/BaseButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function FeedbackSubmittedScreen() {
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
          {t("feedback.submitted_title")}
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
          {t("feedback.submitted_subtitle")}
        </Text>

        <Ionicons name="checkmark-circle-outline" size={24} color="white" />
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", padding: 40 }}>
        <BaseButton
          backgroundColor="#ffffffff"
          borderRadius={20}
          borderWidth={0}
          borderColor="transparent"
          onPress={() => router.replace("/(tabs)/present")}
          height={45}
        >
          <Text style={{ color: "black", fontWeight: "600" }}>
            {t("feedback.submitted_button")}
          </Text>
        </BaseButton>
      </View>
    </View>
  );
}
