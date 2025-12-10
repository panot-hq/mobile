import ArrowButton from "@/components/auth/buttons/ArrowButton";
import ContactInteractionTimeline from "@/components/contacts/ContactInteractionTimeline";
import RecordingOverlay from "@/components/recording/RecordingOverlay";
import Badge from "@/components/ui/Badge";
import BaseButton from "@/components/ui/BaseButton";
import { useAuth } from "@/contexts/AuthContext";
import { ProcessQueueService } from "@/lib/database/services/process-queue";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import { contacts$ } from "@/lib/supaLegend";
import {
  CommunicationChannel,
  stringifyCommunicationChannels,
} from "@/lib/types/communicationChannel";
import { useSelector } from "@legendapp/state/react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  FadeInRight,
  FadeOut,
  FadeOutRight,
  useAnimatedStyle,
  withTiming,
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

  const [isEditMode, setIsEditMode] = useState(false);
  const [openedFromTapEmptyDetails, setOpenedFromTapEmptyDetails] =
    useState(false);
  const [nameValue, setNameValue] = useState("");
  const [detailsValue, setDetailsValue] = useState("");

  const originalName = useRef("");
  const originalDetails = useRef("");

  const { user } = useAuth();

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
    if (contact && !isEditMode) {
      const fullName = `${contact.first_name || ""} ${
        contact.last_name || ""
      }`.trim();
      setNameValue(fullName);
      setDetailsValue(getContextString(contact.details.summary));
    }
  }, [
    contact,
    contact?.details,
    contact?.first_name,
    contact?.last_name,
    isEditMode,
  ]);

  const handleEnterEditMode = () => {
    if (!contact) return;
    originalName.current = `${contact.first_name || ""} ${
      contact.last_name || ""
    }`.trim();
    originalDetails.current = getContextString(contact.details.summary);
    setIsEditMode(true);
  };

  const handleSaveChanges = async () => {
    if (!contact) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Guardar Cambios"],
        cancelButtonIndex: 0,
        title: "Confirmar Cambios",
        message: "¿Estás seguro de que quieres guardar los cambios realizados?",
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          await performSave();
        }
      }
    );
  };

  const performSave = async () => {
    if (!contact) return;

    try {
      let nameChanged = false;
      let detailsChanged = false;

      const trimmedName = nameValue.trim();
      if (!trimmedName) {
        setNameValue(originalName.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (trimmedName !== originalName.current) {
        const [firstName, ...lastNameParts] = trimmedName.split(" ");
        const lastName = lastNameParts.join(" ");

        updateContactData(contact.id, {
          first_name: firstName || "",
          last_name: lastName || "",
        });
        nameChanged = true;
      }

      const trimmedDetails = detailsValue.trim();
      if (trimmedDetails !== originalDetails.current) {
        updateContactData(contact.id, {
          details: {
            ...contact.details,
            summary: trimmedDetails,
          },
        });

        await ProcessQueueService.enqueue({
          userId: user!.id,
          contactId: contact.id,
          jobType: "DETAILS_UPDATE",
          payload: {
            details: trimmedDetails,
          },
        });
        detailsChanged = true;
      }

      if (nameChanged || detailsChanged) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsEditMode(false);
      setOpenedFromTapEmptyDetails(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No se pudieron guardar los cambios");
    }
  };

  const handleCancelEdit = () => {
    setNameValue(originalName.current);
    setDetailsValue(originalDetails.current);
    setIsEditMode(false);
    setOpenedFromTapEmptyDetails(false);
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
    backgroundColor: withTiming(isEditMode ? "#fff" : "#E9E9E9"),
    borderRadius: 23,
    padding: 20,
    marginBottom: !isEditMode ? 50 : 35,
    borderWidth: 1,
    borderColor: withTiming(isEditMode ? "#ddd" : "transparent"),
  }));

  const hasDetails = detailsValue.trim().length > 0;
  const showEmptyState = !hasDetails && !isEditMode;

  const contextContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 7,
    padding: showEmptyState ? 0 : 12,
    borderWidth: withTiming(isEditMode ? 1 : showEmptyState ? 1 : 0),
    borderColor: withTiming(
      isEditMode ? "#ddd" : showEmptyState ? "#ccc" : "transparent"
    ),
    borderStyle: isEditMode ? "solid" : showEmptyState ? "dashed" : "solid",

    minHeight: 150,
    justifyContent: showEmptyState ? "center" : "flex-start",
    alignItems: showEmptyState ? "center" : "stretch",
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
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          {!isEditMode && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
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
            </Animated.View>
          )}
        </View>

        <Animated.View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {!isEditMode && (
            <Animated.View
              entering={FadeInRight.duration(200)}
              exiting={FadeOutRight.duration(200)}
            >
              <BaseButton
                backgroundColor="white"
                borderRadius={13}
                borderWidth={1}
                borderColor="#ddd"
                onPress={() => {
                  handleEnterEditMode();
                }}
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
                  {isEditMode ? "cancel" : "edit"}
                </Text>
              </BaseButton>
            </Animated.View>
          )}
          {isEditMode && (
            <Animated.View
              style={{ flexDirection: "row", gap: 10 }}
              entering={FadeInRight.duration(200)}
              exiting={FadeOutRight.duration(200)}
            >
              <BaseButton
                backgroundColor="white"
                borderRadius={13}
                borderWidth={1}
                borderColor="#ddd"
                onPress={handleCancelEdit}
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
                  cancel
                </Text>
              </BaseButton>
              <BaseButton
                backgroundColor="#000"
                borderRadius={13}
                onPress={handleSaveChanges}
                style={{
                  paddingHorizontal: 15,
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
                  save
                </Text>
              </BaseButton>
            </Animated.View>
          )}
        </Animated.View>
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
        <Animated.View
          style={[
            {
              marginBottom: 15,
              justifyContent: "center",
            },
            nameContainerAnimatedStyle,
          ]}
        >
          {isEditMode ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <TextInput
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                  color: "#000",
                }}
                value={nameValue}
                onChangeText={setNameValue}
                placeholder="Full name"
              />
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                  color: "#000",
                }}
              >
                {nameValue || ""}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <>
          {!isEditMode && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={{ position: "relative" }}
            >
              <Badge
                title="about"
                color="#E9E9E9"
                textColor="#000"
                textSize={14}
                marginBottom={12}
              />
            </Animated.View>
          )}

          <AnimatedPressable
            style={[
              {
                marginBottom: 40,
              },
              contextContainerAnimatedStyle,
            ]}
            onPress={() => {
              if (!detailsValue.trim() && !isEditMode) {
                setOpenedFromTapEmptyDetails(true);
                handleEnterEditMode();
              }
            }}
          >
            {isEditMode ? (
              <Animated.View
                key="edit-details"
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={{ flex: 1, minHeight: 250 }}
              >
                <TextInput
                  style={{
                    padding: 10,
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                    height: "100%",
                    textAlignVertical: "top",
                  }}
                  value={detailsValue}
                  onChangeText={setDetailsValue}
                  multiline
                  autoFocus={openedFromTapEmptyDetails}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#ccc",
                    textAlign: "left",
                    lineHeight: 15,
                    marginTop: 30,
                  }}
                >
                  *Here you can edit your contact's name and details, once
                  saved, the information of your contact will be changed
                </Text>
              </Animated.View>
            ) : (
              <Animated.View
                key="view-details"
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
              >
                <Text
                  style={{
                    fontSize: detailsValue ? 16 : 12,
                    color: detailsValue ? "#000" : "#ccc",
                    textAlign: detailsValue ? "left" : "center",
                    lineHeight: 22,
                  }}
                >
                  {detailsValue || "Tap to add details"}
                </Text>
              </Animated.View>
            )}
          </AnimatedPressable>
        </>
        {!isEditMode && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ position: "relative" }}
          >
            <ContactInteractionTimeline interactions={interactions} />
          </Animated.View>
        )}
      </ScrollView>

      {!isEditMode && (
        <RecordingOverlay
          onInteractionCreated={handleInteractionCreated}
          contactId={id as string}
          recordButtonPosition={{ bottom: 50, right: 20 }}
          recordButtonInitialSize={100}
        />
      )}

      {isEditMode && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
            position: "absolute",
            bottom: 35,
            right: 20,
            left: 20,
          }}
        >
          <BaseButton
            backgroundColor="#000"
            borderRadius={20}
            onPress={handleDeleteContact}
            style={{
              paddingVertical: 15,
              elevation: 2,
              height: 50,
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
    </View>
  );
}
