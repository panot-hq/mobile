import ArrowButton from "@/components/auth/buttons/ArrowButton";
import CommunicationChannels from "@/components/contacts/CommunicationChannels";
import ContactInteractionItem from "@/components/contacts/ContactInteractionItem";
import RecordingOverlay from "@/components/recording/RecordingOverlay";
import Badge from "@/components/ui/Badge";
import BaseButton from "@/components/ui/BaseButton";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import {
  CommunicationChannel,
  parseCommunicationChannels,
  stringifyCommunicationChannels,
} from "@/lib/types/communicationChannel";
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

  // Hooks de Legend State (local-first)
  const {
    getContact,
    updateContact: updateContactData,
    deleteContact: deleteContactData,
  } = useContacts();
  const { getInteractionsByContact } = useInteractions();

  // Obtener datos reactivamente
  const contact = getContact(id as string);
  const interactions = getInteractionsByContact(id as string);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingProfessionalContext, setIsEditingProfessionalContext] =
    useState(false);
  const [isEditingPersonalContext, setIsEditingPersonalContext] =
    useState(false);
  const [isEditingRelationshipContext, setIsEditingRelationshipContext] =
    useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [professionalContextValue, setProfessionalContextValue] = useState("");
  const [personalContextValue, setPersonalContextValue] = useState("");
  const [relationshipContextValue, setRelationshipContextValue] = useState("");
  const [detailsValue, setDetailsValue] = useState("");
  const [communicationChannels, setCommunicationChannels] = useState<
    CommunicationChannel[]
  >([]);

  // Helper function to safely get string from Json (can be string directly or nested)
  const getContextString = (value: any): string => {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "object" && value !== null) {
      // Legacy format: try to extract from nested object
      // But ideally all contexts should be strings now
      return "";
    }
    return "";
  };

  // Inicializar valores cuando cambie el contacto
  useEffect(() => {
    if (contact) {
      setNameValue(
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
      );
      setProfessionalContextValue(
        getContextString(contact.professional_context)
      );
      setPersonalContextValue(getContextString(contact.personal_context));
      setRelationshipContextValue(
        getContextString(contact.relationship_context)
      );
      setDetailsValue(getContextString(contact.details));
      setCommunicationChannels(
        parseCommunicationChannels(
          contact.communication_channels as string | null
        )
      );
    }
  }, [contact]);

  const handleNameSave = () => {
    if (
      contact &&
      nameValue !==
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
    ) {
      try {
        const [firstName, ...lastNameParts] = nameValue.trim().split(" ");
        const lastName = lastNameParts.join(" ");

        // Actualizar con Legend State (instantáneo, local-first)
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

  const handleProfessionalContextSave = () => {
    if (!contact) return;

    const currentValue = getContextString(contact.professional_context);

    if (professionalContextValue !== currentValue) {
      try {
        updateContactData(contact.id, {
          professional_context: professionalContextValue.trim() || null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingProfessionalContext(false);
  };

  const handlePersonalContextSave = () => {
    if (!contact) return;

    const currentValue = getContextString(contact.personal_context);

    if (personalContextValue !== currentValue) {
      try {
        updateContactData(contact.id, {
          personal_context: personalContextValue.trim() || null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingPersonalContext(false);
  };

  const handleRelationshipContextSave = () => {
    const currentValue =
      typeof contact?.relationship_context === "string"
        ? contact.relationship_context
        : "";
    if (contact && relationshipContextValue !== currentValue) {
      try {
        updateContactData(contact.id, {
          relationship_context: relationshipContextValue.trim() || null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingRelationshipContext(false);
  };

  const handleDetailsSave = () => {
    if (!contact) return;

    const currentValue = getContextString(contact.details);
    if (detailsValue !== currentValue) {
      try {
        updateContactData(contact.id, {
          details: detailsValue.trim() || null,
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
            // Eliminar con Legend State (local-first, soft delete)
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

  const handleInteractionCreated = () => {
    // No hacer nada - Legend State actualiza automáticamente
  };

  const nameContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "#E9E9E9",
    borderRadius: 20,
    padding: 20,
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

        {(professionalContextValue || isEditingProfessionalContext) && (
          <>
            <Badge
              title="professional context"
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
              onPress={() => setIsEditingProfessionalContext(true)}
            >
              {isEditingProfessionalContext ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                    minHeight: 60,
                    textAlignVertical: "top",
                  }}
                  value={professionalContextValue}
                  onChangeText={setProfessionalContextValue}
                  onBlur={handleProfessionalContextSave}
                  placeholder="Describe their professional situation..."
                  multiline
                  autoFocus
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                >
                  {professionalContextValue || ""}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {(personalContextValue || isEditingPersonalContext) && (
          <>
            <Badge
              title="personal context"
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
              onPress={() => setIsEditingPersonalContext(true)}
            >
              {isEditingPersonalContext ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                    minHeight: 60,
                    textAlignVertical: "top",
                  }}
                  value={personalContextValue}
                  onChangeText={setPersonalContextValue}
                  onBlur={handlePersonalContextSave}
                  placeholder="Describe their personal information..."
                  multiline
                  autoFocus
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                >
                  {personalContextValue || ""}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {(relationshipContextValue || isEditingRelationshipContext) && (
          <>
            <Badge
              title="relationship context"
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
              onPress={() => setIsEditingRelationshipContext(true)}
            >
              {isEditingRelationshipContext ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                    minHeight: 60,
                    textAlignVertical: "top",
                  }}
                  value={relationshipContextValue}
                  onChangeText={setRelationshipContextValue}
                  onBlur={handleRelationshipContextSave}
                  placeholder="How you met or relationship context..."
                  multiline
                  autoFocus
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                >
                  {relationshipContextValue || ""}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {(detailsValue || isEditingDetails) && (
          <>
            <Badge
              title="details"
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
                  placeholder="Additional notes or details..."
                  multiline
                  autoFocus
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                >
                  {detailsValue || ""}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {interactions.length > 0 && (
          <>
            <Badge
              title="list of interactions"
              color="#E9E9E9"
              textColor="#000"
              textSize={14}
              marginBottom={20}
            />
            <View style={{ gap: 10, marginBottom: 80 }}>
              {interactions.map((interaction) => (
                <ContactInteractionItem
                  key={interaction.id}
                  interaction={interaction}
                />
              ))}
            </View>
          </>
        )}
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
