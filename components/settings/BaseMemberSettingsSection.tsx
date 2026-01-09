import PanotLogo from "@/assets/icons/panot-white.svg";
import BaseButton from "@/components/ui/BaseButton";
import { MeshGradientView } from "expo-mesh-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface BaseMemberSettingsSectionProps {
  isSubscribed: boolean;
  setIsSubscribed: (isSubscribed: boolean) => void;
}

export default function BaseMemberSettingsSection({
  isSubscribed,
  setIsSubscribed,
}: BaseMemberSettingsSectionProps) {
  const { t } = useTranslation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleSubscribePress = () => {
    router.push("/(auth)/(paywall)/paywall");
  };

  if (isSubscribed) {
    return (
      <View
        style={{
          marginTop: 130,
          marginHorizontal: 24,
          borderRadius: 20,
          overflow: "hidden",
          height: 120,
        }}
      >
        <MeshGradientView
          columns={3}
          rows={3}
          colors={[
            "#1a1a1a",
            "#1a1a1a",
            "#1a1a1a",

            "#2a2a2a",
            "#2a2a2a",
            "#2a2a2a",

            "#3a3a3a",
            "#3a3a3a",
            "#3a3a3a",
          ]}
          points={[
            [0.0, 0.0],
            [0.5, 0.0],
            [1.0, 0.0],

            [0.0, 0.5],
            [0.5, 0.5],
            [1.0, 0.5],

            [0.0, 1.0],
            [0.5, 1.0],
            [1.0, 1.0],
          ]}
          style={{
            flex: 1,
          }}
        />

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <PanotLogo width={96} height={32} />
              <View
                style={{
                  marginLeft: 8,
                  borderWidth: 1,
                  borderColor: "#FFFFFF",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "400",
                    color: "#FFFFFF",
                  }}
                >
                  enhanced
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: "#888888",
              marginTop: 12,
              fontWeight: "300",
            }}
          >
            {t("account.subscription_thanks")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        marginTop: 90,
        borderRadius: 20,
        overflow: "hidden",
        height: 280,
      }}
    >
      <MeshGradientView
        columns={3}
        rows={3}
        colors={[
          "#000000",
          "#000000",
          "#000000",

          "#333333ff",
          "#333333ff",
          "#333333ff",

          "#ffffffc8",
          "#ffffffc8",
          "#ffffffc8",
        ]}
        points={[
          [0.0, 0.0],
          [0.5, 0.0],
          [1.0, 0.0],

          [0.0, 0.32],
          [0.5, 0.45],
          [1.0, 0.4],

          [0.0, 1.1],
          [0.5, 1.1],
          [1.0, 1.1],
        ]}
        style={{
          flex: 1,
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 50,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "400",
                color: "#FFFFFF",
              }}
            >
              {t("account.subscription_title")}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "400",
                color: "#FFFFFF",
                marginBottom: 2,
                marginLeft: 8,
                borderWidth: 1,
                borderColor: "#FFFFFF",
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              enhanced
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#868686ff",
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 20,
              paddingHorizontal: 24,
            }}
          >
            {t("account.subscription_description")}
          </Text>

          <BaseButton
            onPress={handleSubscribePress}
            backgroundColor="#000000ff"
            borderRadius={50}
            height={45}
            width={350}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                color: "#ffffffff",
              }}
            >
              {t("account.subscription_button")}
            </Text>
          </BaseButton>
        </View>
      </View>
    </View>
  );
}
