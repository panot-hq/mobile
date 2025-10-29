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
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [companyValue, setCompanyValue] = useState("");
  const [jobTitleValue, setJobTitleValue] = useState("");
  const [departmentValue, setDepartmentValue] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [communicationChannels, setCommunicationChannels] = useState<
    CommunicationChannel[]
  >([]);

  // Inicializar valores cuando cambie el contacto
  useEffect(() => {
    if (contact) {
      setNameValue(
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
      );
      setCompanyValue(contact.company || "");
      setJobTitleValue(contact.job_title || "");
      setDepartmentValue(contact.department || "");
      setAddressValue(contact.address || "");
      setNotesValue(contact.notes || "");
      setCommunicationChannels(
        parseCommunicationChannels(contact.communication_channels)
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

  const handleCompanySave = () => {
    if (contact && companyValue !== contact.company) {
      try {
        updateContactData(contact.id, {
          company: companyValue,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingCompany(false);
  };

  const handleJobTitleSave = () => {
    if (contact && jobTitleValue !== contact.job_title) {
      try {
        updateContactData(contact.id, {
          job_title: jobTitleValue,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingJobTitle(false);
  };

  const handleDepartmentSave = () => {
    if (contact && departmentValue !== contact.department) {
      try {
        updateContactData(contact.id, {
          department: departmentValue,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingDepartment(false);
  };

  const handleAddressSave = () => {
    if (contact && addressValue !== contact.address) {
      try {
        updateContactData(contact.id, {
          address: addressValue,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingAddress(false);
  };

  const handleNotesSave = () => {
    if (contact && notesValue !== contact.notes) {
      try {
        updateContactData(contact.id, {
          notes: notesValue,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    setIsEditingNotes(false);
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
    backgroundColor: "rgba(245, 245, 245, 0.8)",
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditingName ? 0 : 1,
    borderColor: "#ddd",
  }));

  const companyContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
  }));

  const jobTitleContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
  }));

  const departmentContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
  }));

  const addressContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
  }));

  const notesContainerAnimatedStyle = useAnimatedStyle(() => ({
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
              borderWidth: 1,
              borderColor: "#ddd",
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

        <View style={{ marginBottom: 20 }}>
          <CommunicationChannels
            channels={communicationChannels}
            onChannelsChange={handleCommunicationChannelsChange}
          />
        </View>

        {companyValue && (
          <>
            <Badge
              title="company"
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
                companyContainerAnimatedStyle,
              ]}
              onPress={() => setIsEditingCompany(true)}
            >
              {isEditingCompany ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                  value={companyValue}
                  onChangeText={setCompanyValue}
                  onBlur={handleCompanySave}
                  placeholder="Company"
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
                  {companyValue}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {jobTitleValue && (
          <>
            <Badge
              title="job title"
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
                jobTitleContainerAnimatedStyle,
              ]}
              onPress={() => setIsEditingJobTitle(true)}
            >
              {isEditingJobTitle ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                  value={jobTitleValue}
                  onChangeText={setJobTitleValue}
                  onBlur={handleJobTitleSave}
                  placeholder="Job title"
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
                  {jobTitleValue}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {departmentValue && (
          <>
            <Badge
              title="department"
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
                departmentContainerAnimatedStyle,
              ]}
              onPress={() => setIsEditingDepartment(true)}
            >
              {isEditingDepartment ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                  value={departmentValue}
                  onChangeText={setDepartmentValue}
                  onBlur={handleDepartmentSave}
                  placeholder="Department"
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
                  {departmentValue}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {addressValue && (
          <>
            <Badge
              title="address"
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
                addressContainerAnimatedStyle,
              ]}
              onPress={() => setIsEditingAddress(true)}
            >
              {isEditingAddress ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                  }}
                  value={addressValue}
                  onChangeText={setAddressValue}
                  onBlur={handleAddressSave}
                  placeholder="Address"
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
                  {addressValue}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        {notesValue && (
          <>
            <Badge
              title="notes"
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
                notesContainerAnimatedStyle,
              ]}
              onPress={() => setIsEditingNotes(true)}
            >
              {isEditingNotes ? (
                <TextInput
                  style={{
                    fontSize: 16,
                    color: "#000",
                    lineHeight: 22,
                    minHeight: 60,
                    textAlignVertical: "top",
                  }}
                  value={notesValue}
                  onChangeText={setNotesValue}
                  onBlur={handleNotesSave}
                  placeholder="Notes"
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
                  {notesValue}
                </Text>
              )}
            </AnimatedPressable>
          </>
        )}

        <Badge
          title="interactions"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={5}
        />

        <View style={{ gap: 10, marginBottom: 80 }}>
          {interactions.map((interaction) => (
            <ContactInteractionItem
              key={interaction.id}
              interaction={interaction}
            />
          ))}
        </View>
        {showOptions && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={{
              position: "absolute",
              left: 22,
              bottom: 0,
              zIndex: 10,
              width: "100%",
              height: 80,
            }}
          >
            <BaseButton
              backgroundColor="#111"
              borderRadius={20}
              width={130}
              onPress={handleDeleteContact}
              style={{
                elevation: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
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
