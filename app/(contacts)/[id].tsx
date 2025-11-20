import ArrowButton from "@/components/auth/buttons/ArrowButton";
import CommunicationChannels from "@/components/contacts/CommunicationChannels";
import ContactInteractionTimeline from "@/components/contacts/ContactInteractionTimeline";
import RecordingOverlay from "@/components/recording/RecordingOverlay";
import Badge from "@/components/ui/Badge";
import BaseButton from "@/components/ui/BaseButton";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import { contacts$ } from "@/lib/supaLegend";
import {
  CommunicationChannel,
  parseCommunicationChannels,
  stringifyCommunicationChannels,
} from "@/lib/types/communicationChannel";
import { useSelector } from "@legendapp/state/react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams();

  const { updateContact: updateContactData, deleteContact: deleteContactData } =
    useContacts();
  const { getInteractionsByContact } = useInteractions();

  const contact = useSelector(() => {
    // @ts-ignore
    const contactData = contacts$[id as string]?.get();
    if (!contactData || contactData.deleted) return undefined;
    return contactData;
  });

  const interactions = getInteractionsByContact(id as string);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [detailsValue, setDetailsValue] = useState("");
  const [communicationChannels, setCommunicationChannels] = useState<
    CommunicationChannel[]
  >([]);

  const getContextString = (value: any): string => {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "object" && value !== null) {
      return "";
    }
    return "";
  };

  useEffect(() => {
    if (contact) {
      setNameValue(
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
      );
      setDetailsValue(getContextString(contact.details));
      setCommunicationChannels(
        parseCommunicationChannels(contact.communication_channels as string)
      );
    }
  }, [
    contact,
    contact?.details,
    contact?.first_name,
    contact?.last_name,
    contact?.communication_channels,
  ]);

  const handleNameSave = () => {
    if (
      contact &&
      nameValue !==
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
    ) {
      try {
        const [firstName, ...lastNameParts] = nameValue.trim().split(" ");
        const lastName = lastNameParts.join(" ");

        updateContactData(contact.id, {
          first_name: firstName || "",
          last_name: lastName || "",
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingName(false);
  };

  const handleDetailsSave = () => {
    if (!contact) return;

    const currentValue = getContextString(contact.details);
    if (detailsValue !== currentValue) {
      try {
        updateContactData(contact.id, {
          details: detailsValue.trim() || "",
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingDetails(false);
  };

  const handleCommunicationChannelsChange = (
    channels: CommunicationChannel[]
  ) => {
    if (!contact) return;
    try {
      updateContactData(contact.id, {
        communication_channels:
          channels.length > 0 ? stringifyCommunicationChannels(channels) : null,
      });
      setCommunicationChannels(channels);
    } catch (error) {
      console.error("Error updating communication channels:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeleteContact = () => {
    if (!contact) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Eliminar Contacto"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "Eliminar Contacto",
        message: `¿Estás seguro de que quieres eliminar a ${contact.first_name} ${contact.last_name}? Esta acción no se puede deshacer.`,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            deleteContactData(contact.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch (error) {
            console.error("Error deleting contact:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "No se pudo eliminar el contacto");
          }
        }
      }
    );
  };

  const handleInteractionCreated = () => {};

  const nameContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "#E9E9E9",
    borderRadius: 20,
    padding: 20,
    marginBottom: 50,
  }));

  const contextContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          position: "absolute",
          top: 68,
          paddingHorizontal: 20,
          zIndex: 1,
          flexDirection: "row",
          gap: 10,
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <ArrowButton
          onPress={() => router.back()}
          iconDimensions={23}
          iconColor="#444"
          backgroundColor="white"
          borderRadius={13}
          borderWidth={1}
          borderColor="#ddd"
        />
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          {showOptions && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(100)}
            >
              <BaseButton
                backgroundColor="#111"
                borderRadius={13}
                width={120}
                onPress={handleDeleteContact}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  delete
                </Text>
              </BaseButton>
            </Animated.View>
          )}
          <BaseButton
            backgroundColor="white"
            borderRadius={13}
            borderWidth={1}
            borderColor="#ddd"
            onPress={() => setShowOptions(!showOptions)}
            style={{
              paddingHorizontal: 15,
              paddingVertical: 10,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: "#444",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {showOptions ? "hide" : "options"}
            </Text>
          </BaseButton>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: 20 }}
        contentContainerStyle={{
          paddingTop: 120,
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedPressable
          style={[
            {
              marginBottom: 15,
              justifyContent: "center",
            },
            nameContainerAnimatedStyle,
          ]}
          onPress={() => setIsEditingName(true)}
        >
          {isEditingName ? (
            <TextInput
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: "#000",
              }}
              value={nameValue}
              onChangeText={setNameValue}
              onBlur={handleNameSave}
              placeholder="Full name"
              autoFocus
            />
          ) : (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: "#000",
              }}
            >
              {nameValue || ""}
            </Text>
          )}
        </AnimatedPressable>

        <View style={{ marginBottom: 20, display: "none" }}>
          <CommunicationChannels
            channels={communicationChannels}
            onChannelsChange={handleCommunicationChannelsChange}
          />
        </View>

        <>
          <Badge
            title="about"
            color="#E9E9E9"
            textColor="#000"
            textSize={14}
            marginBottom={5}
          />

          <AnimatedPressable
            style={[
              {
                marginBottom: 20,
              },
              contextContainerAnimatedStyle,
            ]}
            onPress={() => setIsEditingDetails(true)}
          >
            {isEditingDetails ? (
              <TextInput
                style={{
                  fontSize: 16,
                  color: "#000",
                  lineHeight: 22,
                  minHeight: 60,
                  textAlignVertical: "top",
                }}
                value={detailsValue}
                onChangeText={setDetailsValue}
                onBlur={handleDetailsSave}
                multiline
                autoFocus
              />
            ) : (
              <Text
                style={{
                  fontSize: detailsValue ? 16 : 12,
                  color: detailsValue ? "#000" : "#ccc",
                  lineHeight: 22,
                }}
              >
                {detailsValue || "Tap to add details"}
              </Text>
            )}
          </AnimatedPressable>
        </>

        <ContactInteractionTimeline interactions={interactions} />
      </ScrollView>

      <RecordingOverlay
        onInteractionCreated={handleInteractionCreated}
        contactId={id as string}
        recordButtonPosition={{ bottom: 50, right: 20 }}
        recordButtonInitialSize={100}
      />
    </View>
  );
}
