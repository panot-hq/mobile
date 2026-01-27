import ArrowButton from "@/components/auth/buttons/ArrowButton";
import SettingsSection from "@/components/settings/SettingsSection";
import BaseButton from "@/components/ui/BaseButton";
import { useAuth } from "@/contexts/AuthContext";
import { ProfilesService } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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


export default function AccountSettingsScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const saveButtonPosition = useSharedValue(screenHeight);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const stateRef = useRef({ hasChanges, name });
  useEffect(() => {
    stateRef.current = { hasChanges, name };
  }, [hasChanges, name]);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleSaveNameChanges = async (providedName?: string) => {
    const nameToSave = providedName ?? stateRef.current.name;
    if (!user || (!stateRef.current.hasChanges && !providedName)) return;

    setIsSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: nameToSave },
      });

      if (updateError) {
        Alert.alert(t("common.error"), t("account.save_error"));
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert(t("common.error"), t("account.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const willShowSub = Keyboard.addListener("keyboardWillShow", (event) => {
      setIsKeyboardVisible(true);
      const keyboardY = event.endCoordinates.screenY;
      setKeyboardHeight(keyboardY);
      if (hasChanges) {
        saveButtonPosition.value = withSpring(keyboardY - 70);
      }
    });

    const willHideSub = Keyboard.addListener("keyboardWillHide", () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(screenHeight);
      if (stateRef.current.hasChanges) {
        handleSaveNameChanges();
      }
    });

    return () => {
      willShowSub.remove();
      willHideSub.remove();
    };
  }, [hasChanges]);

  useEffect(() => {
    if (hasChanges && isKeyboardVisible) {
      const targetY =
        keyboardHeight > 0 && keyboardHeight < screenHeight
          ? keyboardHeight - 45
          : screenHeight - 300;
      saveButtonPosition.value = withSpring(targetY);
    } else {
      saveButtonPosition.value = withSpring(screenHeight);
    }
  }, [hasChanges, keyboardHeight, isKeyboardVisible]);

  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    top: saveButtonPosition.value - 20,
  }));

  const loadUserData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const displayName = user.user_metadata?.display_name || "";
      setName(displayName);
      setEmail(user.email || "");
      const { data: profile } = await ProfilesService.getByUserId(user.id);
      if (profile) setIsSubscribed(profile.subscribed);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForChanges = (newName: string, newEmail: string) => {
    const originalName = user?.user_metadata?.display_name || "";
    const originalEmail = user?.email || "";
    setHasChanges(newName !== originalName || newEmail !== originalEmail);
  };

  const handleNameChange = (text: string) => {
    setName(text);
    checkForChanges(text, email);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("account.delete_confirm_title"),
      t("account.delete_confirm_message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("account.delete_confirm_button"),
          style: "destructive",
          onPress: async () => {
            try {
              if (!user) return;
              const { error: profileError } = await ProfilesService.delete(
                user.id
              );
              if (profileError) throw profileError;
              await signOut();
            } catch (error) {
              Alert.alert(t("common.error"), t("account.delete_error"));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000ff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000000ff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ position: "absolute", top: 55, left: 12, zIndex: 1 }}>
        <ArrowButton
          onPress={() => router.back()}
          iconDimensions={28}
          iconColor="white"
          borderRadius={13}
          settings={true}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 130, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ fontSize: 40, fontWeight: "200", color: "white" }}>
            {t("account.title")}
          </Text>
        </View>

        <SettingsSection>
          <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
            <Text
              style={{
                fontSize: 14,
                color: "#CCCCCC",
                marginBottom: 15,
                marginLeft: 5,
                fontWeight: "200",
              }}
            >
              {t("account.name_label")}
            </Text>
            <TextInput
              style={{
                backgroundColor: "#2A2A2A",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "white",
              }}
              value={name}
              onChangeText={handleNameChange}
              placeholder={t("account.name_placeholder")}
              placeholderTextColor="#666666"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </SettingsSection>

{/*
          <BaseMemberSettingsSection
            isSubscribed={isSubscribed}
            setIsSubscribed={setIsSubscribed}
          />
*/}
            

        <View style={{ 
          marginTop: 15, 
          marginBottom: 32, 
          padding: 20, 
          marginHorizontal: 20,
          borderWidth: .7,
          borderStyle: "dashed",
          borderColor: "#444",
          borderRadius: 16,
        }}>
        
        <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {t("account.delete_account")}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#fff",
                fontWeight: "300",
                marginBottom: 20,
                lineHeight: 18,
              }}
            >
              {t("account.delete_account_subtitle")}
            </Text>
            <BaseButton
              onPress={handleDeleteAccount}
              backgroundColor="#fff"
              borderRadius={22}
              height={44}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                {t("account.delete_account")}
              </Text>
            </BaseButton>
        </View>
      </ScrollView>

      {hasChanges && isKeyboardVisible && (
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
            saveButtonAnimatedStyle,
          ]}
        >
          {isSaving ? (
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
                handleSaveNameChanges();
                Keyboard.dismiss();
              }}
              width={Dimensions.get("window").width - 48}
              height={45}
              backgroundColor="white"
              borderRadius={24}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#000000" }}
              >
                {t("account.save_changes")}
              </Text>
            </BaseButton>
          )}
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}
