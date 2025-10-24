import KeyboardSaveButton from "@/components/contacts/KeyboardSaveButton";
import NewContactCloseButton from "@/components/contacts/NewContactCloseButton";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/lib/hooks/useLegendState";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company: "",
    job_title: "",
    department: "",
    address: "",
    notes: "",
  });
  const [contactName, setContactName] = useState("New Contact");

  const hasUnsavedChanges = () => {
    return Object.values(formData).some((value) => value.trim() !== "");
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "first_name") {
      setContactName(value.trim() || "New Contact");
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
      formData.first_name.trim() !== "" ||
      formData.last_name.trim() !== "" ||
      formData.company.trim() !== ""
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
      // Crear contacto con Legend State (instantáneo, funciona offline)
      createContact({
        ...formData,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error creating contact:", error);
      Alert.alert("Error", "Failed to save contact. Please try again.");
    }
  };

  const renderInputField = (
    field: keyof typeof formData,
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
        value={formData[field]}
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
          {renderInputField("first_name", "First name", false, true)}
          {renderInputField("last_name", "Last name")}
        </View>
        {renderInputField(
          "notes",
          "any notes or relevant info about this contact...",
          true,
          false
        )}
      </ScrollView>

      <KeyboardSaveButton
        onPress={handleSave}
        isEnabled={isFormValid()}
        isLoading={false}
      />
    </KeyboardAvoidingView>
  );
}
