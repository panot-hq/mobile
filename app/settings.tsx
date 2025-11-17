import CloseSettingsButton from "@/components/settings/CloseSettingsButton";
import LanguageSelector from "@/components/settings/LanguageSelector";
import SettingItem from "@/components/settings/SettingItem";
import SettingsSection from "@/components/settings/SettingsSection";

import PanotLogo from "@/assets/icons/panot-logo-white.svg";

import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { transcriptionLanguage, setTranscriptionLanguage } = useSettings();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleAccountSettings = () => {
    // TODO: Navigate to account settings
    Alert.alert(
      "Account Settings",
      "Account settings functionality coming soon!"
    );
  };

  const handleDataPrivacy = () => {
    // TODO: Navigate to data privacy page
    Alert.alert("Data Privacy", "Data privacy settings coming soon!");
  };

  const handleLanguageChange = (languageCode: string) => {
    setTranscriptionLanguage(languageCode);
  };

  const handleNotificationSettings = () => {
    // TODO: Navigate to detailed notification settings
    Alert.alert(
      "Notification Settings",
      "Detailed notification settings coming soon!"
    );
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
            Settings
          </Text>
        </View>

        <SettingsSection>
          <LanguageSelector
            selectedLanguage={transcriptionLanguage}
            onLanguageChange={handleLanguageChange}
          />
          <SettingItem
            title="Sign Out"
            subtitle="Sign out of your account"
            icon="sign-out"
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
          Curated with care for the people
        </Text>
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "200" }}>
          version 0.1.0
        </Text>
      </View>
    </>
  );
}
