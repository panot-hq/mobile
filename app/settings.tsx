import CloseSettingsButton from "@/components/settings/CloseSettingsButton";
import SettingItem from "@/components/settings/SettingItem";
import SettingsSection from "@/components/settings/SettingsSection";

import AuthButton from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
  const { signOut, user } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("Spanish");

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

  const handleAbout = () => {
    // TODO: Navigate to about page
    Alert.alert("About", "About page functionality coming soon!");
  };

  const handleDataPrivacy = () => {
    // TODO: Navigate to data privacy page
    Alert.alert("Data Privacy", "Data privacy settings coming soon!");
  };

  const handleTranscriptionLanguage = () => {
    // TODO: Show language selection modal
    Alert.alert("Transcription Language", "Language selection coming soon!");
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

        <SettingsSection title="account settings">
          <SettingItem
            title="Profile Information"
            subtitle="Update your name, email, and profile picture"
            icon="person"
            onPress={handleAccountSettings}
          />
          <SettingItem
            title="Change Password"
            subtitle="Update your account password"
            icon="lock"
            onPress={handleAccountSettings}
          />
        </SettingsSection>

        <SettingsSection title="voice recognition">
          <SettingItem
            title="Language"
            subtitle={`Currently set to ${transcriptionLanguage}`}
            icon="language"
            onPress={handleTranscriptionLanguage}
          />
        </SettingsSection>

        <SettingsSection title="data privacy">
          <SettingItem
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            icon="privacy-tip"
            onPress={handleDataPrivacy}
          />

          <SettingItem
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon="delete-forever"
            onPress={handleDataPrivacy}
          />
        </SettingsSection>

        <SettingsSection title="about">
          <SettingItem title="App Version" subtitle="Early MVP" icon="info" />
          <SettingItem
            title="Terms of Service"
            subtitle="Read our terms of service"
            icon="description"
            onPress={handleAbout}
          />
          <SettingItem
            title="Support"
            subtitle="Get help and contact support"
            icon="help"
            onPress={handleAbout}
          />
          <SettingItem
            title="Rate App"
            subtitle="Rate us on the App Store"
            icon="star"
            onPress={handleAbout}
          />
        </SettingsSection>

        <View
          style={{
            marginTop: 20,
            paddingHorizontal: 40,
            alignItems: "center",
          }}
        >
          <AuthButton
            title="Sign Out"
            onPress={handleSignOut}
            variant="secondary"
            height={50}
            style={{
              width: "80%",
              backgroundColor: "#000",
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}
