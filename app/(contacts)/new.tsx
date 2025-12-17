import KeyboardSaveButton from "@/components/contacts/KeyboardSaveButton";
import NewContactCloseButton from "@/components/contacts/NewContactCloseButton";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/lib/hooks/useLegendState";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";

import capture_event, { EVENT_TYPES } from "@/lib/posthog-helper";
import { usePostHog } from "posthog-react-native";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function NewContactScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createContact } = useContacts();
  const posthog = usePostHog();

  React.useEffect(() => {
    capture_event(EVENT_TYPES.START_MANUAL_NEW_CONTACT, posthog);
  }, []);

  const params = useLocalSearchParams<{
    transcript?: string;
    mode?: string;
  }>();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    details: "",
  });
  const [contactName, setContactName] = useState(
    t("contacts.new.default_name")
  );

  const hasUnsavedChanges = () => {
    if (formData.first_name.trim() !== "" || formData.last_name.trim() !== "") {
      return true;
    }
    if (formData.details.trim() !== "") {
      return true;
    }
    return false;
  };

  const showUnsavedChangesActionSheet = (onDiscard: () => void) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t("contacts.new.discard_confirm_title"),
          options: [t("common.discard_changes"), t("common.keep_editing")],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onDiscard();
          }
        }
      );
    } else {
      Alert.alert(t("contacts.new.discard_confirm_title"), "", [
        {
          text: t("common.keep_editing"),
          style: "cancel",
          onPress: () => {},
        },
        {
          text: t("common.discard_changes"),
          style: "destructive",
          onPress: onDiscard,
        },
      ]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "first_name") {
      setContactName(value?.trim() || t("contacts.new.default_name"));
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      showUnsavedChangesActionSheet(() => {
        capture_event(EVENT_TYPES.CANCEL_MANUAL_NEW_CONTACT, posthog, {
          has_data: true,
        });
        router.back();
      });
    } else {
      capture_event(EVENT_TYPES.CANCEL_MANUAL_NEW_CONTACT, posthog, {
        has_data: false,
      });
      router.back();
    }
  };

  const isFormValid = () => {
    return (
      formData.first_name?.trim() !== "" || formData.last_name?.trim() !== ""
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert(t("common.error"), t("common.user_not_authenticated"));
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const detailsJson = {
        summary: formData.details.trim() || "",
        updated_at: new Date().toISOString(),
      };

      const contactData = {
        first_name: formData.first_name.trim() || "",
        last_name: formData.last_name.trim() || "",
        details: detailsJson,
        deleted: false,
        communication_channels: null,
      };

      await createContact(contactData as any);

      capture_event(EVENT_TYPES.MANUAL_NEW_CONTACT_SUCCESS, posthog);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error creating contact:", error);
      Alert.alert(t("common.error"), t("contacts.new.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldValue = (field: string): string => {
    return (formData[field as keyof typeof formData] as string) || "";
  };

  const renderInputField = (
    field: string,
    placeholder: string,
    multiline: boolean = false,
    focus: boolean = false
  ) => (
    <View>
      <TextInput
        style={{
          backgroundColor: "#f5f5f5",
          borderRadius: 12,
          padding: 16,
          fontSize: 16,
          color: "#000",
          minHeight: multiline ? 100 : 50,
          textAlignVertical: multiline ? "top" : "center",
        }}
        value={getFieldValue(field)}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        autoCapitalize={
          field === "first_name" || field === "last_name"
            ? "words"
            : "sentences"
        }
        autoCorrect={false}
        spellCheck={false}
        autoFocus={focus}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NewContactCloseButton onClose={handleClose} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "600",
            color: "#000",
            marginBottom: 32,
          }}
        >
          {contactName}
        </Text>
        <View style={{ gap: 10, marginBottom: 30 }}>
          {renderInputField(
            "first_name",
            t("contacts.new.name_placeholder"),
            false,
            true
          )}
        </View>

        <View style={{ gap: 10, marginBottom: 30 }}>
          {renderInputField(
            "details",
            t("contacts.new.details_placeholder"),
            true,
            false
          )}
        </View>
      </ScrollView>

      <KeyboardSaveButton
        onPress={handleSave}
        isEnabled={isFormValid() && !isSaving}
        isLoading={isSaving}
      />
    </KeyboardAvoidingView>
  );
}
