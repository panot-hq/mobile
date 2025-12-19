import CloseSettingsButton from "@/components/settings/CloseSettingsButton";
import LanguageSelector from "@/components/settings/LanguageSelector";
import SettingItem from "@/components/settings/SettingItem";
import SettingsSection from "@/components/settings/SettingsSection";
import { changeLanguage } from "@/lib/i18n";

import PanotLogo from "@/assets/icons/panot-logo-white.svg";

import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { signOut, user } = useAuth();
  const { transcriptionLanguage, setTranscriptionLanguage } = useSettings();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      t("settings.sign_out_confirm_title"),
      t("settings.sign_out_confirm_message"),
      [
        { text: t("settings.sign_out_cancel"), style: "cancel" },
        {
          text: t("settings.sign_out"),
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Error signing out:", error);
              Alert.alert(
                t("settings.sign_out_failed_title"),
                t("settings.sign_out_failed_message")
              );
            }
          },
        },
      ]
    );
  };

  const handleAccountSettings = () => {
    // TODO Navigate to account settings
    Alert.alert(
      "Account Settings",
      "Account settings functionality coming soon!"
    );
  };

  const handleLanguageChange = (languageCode: string) => {
    setTranscriptionLanguage(languageCode);
  };

  return (
    <>
      <View style={{ position: "absolute", top: 78, right: 30, zIndex: 1000 }}>
        <CloseSettingsButton />
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#000000",
        }}
        contentContainerStyle={{
          paddingTop: 60,
          paddingBottom: 100,
        }}
      >
        <View
          style={{ paddingHorizontal: 20, marginBottom: 40, marginTop: 20 }}
        >
          <Text
            style={{
              fontSize: 50,
              fontWeight: "200",
              lineHeight: 50,
              color: "#FFFFFF",
              marginBottom: 8,
            }}
          >
            {t("settings.title")}
          </Text>
        </View>

        <SettingsSection>
          <LanguageSelector
            label={t("settings.app_language")}
            selectedLanguage={i18n.language}
            onLanguageChange={changeLanguage}
          />
          <LanguageSelector
            label={t("settings.transcription_language")}
            selectedLanguage={transcriptionLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingItem
            title={t("settings.sign_out")}
            subtitle={t("settings.sign_out_subtitle")}
            icon="sign-out"
            onPress={handleSignOut}
          />
          <SettingItem
            title={t("settings.sign_out")}
            subtitle={t("settings.sign_out_subtitle")}
            icon="sign-out"
            onPress={handleSignOut}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingItem
            title={t("settings.sign_out")}
            subtitle={t("settings.sign_out_subtitle")}
            icon="help-outline"
            onPress={handleSignOut}
          />
        </SettingsSection>
      </ScrollView>
      <View
        style={{
          alignItems: "center",
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
        }}
      >
        <PanotLogo width={100} height={100} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "200" }}>
          {t("settings.footer_curated")}
        </Text>
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "200" }}>
          {t("settings.footer_version")}
        </Text>
      </View>
    </>
  );
}
