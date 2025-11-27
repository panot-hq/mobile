import KeyboardSaveButton from "@/components/contacts/KeyboardSaveButton";
import NewContactCloseButton from "@/components/contacts/NewContactCloseButton";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { processContactFromTranscript } from "@/lib/api/process_contact";
import { useContacts } from "@/lib/hooks/useLegendState";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const { user } = useAuth();
  const { createContact } = useContacts();
  const params = useLocalSearchParams<{
    transcript?: string;
    mode?: string;
  }>();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    details: "",
  });
  const [contactName, setContactName] = useState("New Contact");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (params.transcript && params.mode === "talkAboutThem") {
      processTranscript(params.transcript);
    }
  }, [params.transcript, params.mode]);

  const processTranscript = async (transcript: string) => {
    setIsProcessing(true);

    try {
      const displayName = user?.user_metadata?.full_name || "";

      const contactInfo = await processContactFromTranscript(
        transcript,
        displayName
      );

      setFormData({
        first_name: contactInfo.first_name || "",
        last_name: contactInfo.last_name?.trim() || "",
        details: contactInfo.details || "",
      });

      if (contactInfo.first_name) {
        setContactName(contactInfo.first_name);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error processing transcript:", error);
      Alert.alert(
        "Error",
        "No se pudo procesar la información. Por favor, ingresa los datos manualmente."
      );
    } finally {
      setIsProcessing(false);
    }
  };

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
          title: "Are you sure you want to discard this new contact?",
          options: ["Discard Changes", "Keep Editing"],
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
      Alert.alert("Are you sure you want to discard this new contact?", "", [
        {
          text: "Keep Editing",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Discard Changes",
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
      setContactName(value?.trim() || "New Contact");
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      showUnsavedChangesActionSheet(() => {
        router.back();
      });
    } else {
      router.back();
    }
  };

  const isFormValid = () => {
    return (
      formData.first_name?.trim() !== "" || formData.last_name?.trim() !== ""
    );
  };

  const handleSave = () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!isFormValid()) {
      Alert.alert("Error", "Please fill in at least a name or company");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const contactData = {
        first_name: formData.first_name.trim() || "",
        last_name: formData.last_name.trim() || "",
        details: formData.details.trim() || "",
        deleted: false,
        communication_channels: null,
      };

      createContact(contactData as any);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error creating contact:", error);
      Alert.alert("Error", "Failed to save contact. Please try again.");
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
        autoFocus={focus && !isProcessing && params.mode !== "talkAboutThem"}
      />
    </View>
  );

  if (isProcessing) {
    return <LoadingScreen />;
  }

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
          {renderInputField("first_name", "First name", false, true)}
          {renderInputField("last_name", "Last name")}
        </View>

        <View style={{ gap: 10, marginBottom: 30 }}>
          {renderInputField("details", "About this contact...", true, false)}
        </View>
      </ScrollView>

      <KeyboardSaveButton
        onPress={handleSave}
        isEnabled={isFormValid()}
        isLoading={false}
      />
    </KeyboardAvoidingView>
  );
}
