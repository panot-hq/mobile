import ArrowButton from "@/components/auth/buttons/ArrowButton";
import ContactCardActionButton from "@/components/contacts/ContactCardActionButton";
import Badge from "@/components/ui/Badge";
import { useContacts } from "@/contexts/ContactsContext";
import { useInteraction } from "@/contexts/InteractionContext";
import {
  Contact,
  ContactsService,
  Interaction,
  InteractionsService,
} from "@/lib/database/index";
import { formatCreatedAt } from "@/lib/utils/dateFormatter";
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface InteractionItemProps {
  interaction: Interaction;
}

function InteractionItem({ interaction }: InteractionItemProps) {
  const scale = useSharedValue(1);
  const formatted = formatCreatedAt(interaction.created_at);

  let datePart = formatted;
  let hourPart = "";
  if (formatted.includes("at")) {
    const [date, hour] = formatted.split("at");
    datePart = date.trim();
    hourPart = hour.trim();
  }

  const truncatedContent =
    interaction.raw_content.length > 30
      ? interaction.raw_content.substring(0, 30) + "..."
      : interaction.raw_content;

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(interactions)/${interaction.id}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        {
          padding: 20,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "white",
          gap: 10,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 13 }}>{datePart}</Text>
        <Text style={{ fontSize: 13 }}>{hourPart}</Text>
      </View>
      <Text
        style={{
          color: "#666",
          fontSize: 12,
        }}
      >
        {truncatedContent}
      </Text>
    </AnimatedPressable>
  );
}

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { triggerRefresh } = useContacts();
  const { refreshTrigger } = useInteraction();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const fetchInteractions = async () => {
    const { data, error } = await InteractionsService.getByContactId(
      id as string
    );
    if (data) {
      setInteractions(data);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await ContactsService.getById(id as string);
      if (data) {
        setContact(data);
        setEditData(data);
        await fetchInteractions();
      }
      if (error) {
        console.error(error);
      }
    };
    loadData();
  }, [id]);

  // Listen for interaction changes to refresh the interactions list
  useEffect(() => {
    if (id) {
      fetchInteractions();
    }
  }, [refreshTrigger, id]);

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (contact && hasChanges) {
      try {
        const { data, error } = await ContactsService.update(
          contact.id,
          editData
        );
        if (data) {
          setContact(data);
          setIsEditing(false);
          setHasChanges(false);
          triggerRefresh(); // solo cuando haya cambios
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (error) {
          console.error("Error updating contact:", error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (error) {
        console.error("Error updating contact:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      setIsEditing(false);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    setEditData(contact || {});
    setIsEditing(false);
  };

  const handleDiscardChanges = () => {
    if (!hasChanges) {
      setIsEditing(false);
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Descartar Cambios"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: "Descartar Cambios",
          message:
            "¿Estás seguro de que quieres descartar todos los cambios? Esta acción no se puede deshacer.",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setEditData(contact || {});
            setIsEditing(false);
            setHasChanges(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      );
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
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            const { error } = await ContactsService.delete(contact.id);
            if (error) {
              console.error("Error deleting contact:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "No se pudo eliminar el contacto");
            } else {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              // Trigger refresh of contacts list
              triggerRefresh();
              // Navigate back to contacts list
              router.back();
            }
          } catch (error) {
            console.error("Error deleting contact:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "No se pudo eliminar el contacto");
          }
        }
      }
    );
  };

  const updateEditData = (field: keyof Contact, value: string) => {
    setEditData((prev) => {
      const newData = { ...prev, [field]: value };
      if (contact) {
        const hasChanges = Object.keys(newData).some(
          (key) =>
            newData[key as keyof Contact] !== contact[key as keyof Contact]
        );
        setHasChanges(hasChanges);
      }
      return newData;
    });
  };

  const nameContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isEditing
      ? withTiming("white", { duration: 400 })
      : withTiming("rgba(245, 245, 245, 0.8)", { duration: 400 }),
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditing ? 1 : 0,
    borderColor: "#ddd",
  }));

  const notesContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isEditing
      ? withTiming("white", { duration: 400 })
      : withTiming("rgba(245, 245, 245, 0.8)", { duration: 400 }),
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditing ? 1 : 0,
    borderColor: "#E9E9E9",
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
          iconDimensions={20}
          iconColor="#999"
          backgroundColor="white"
          borderRadius={13}
          borderWidth={1}
          borderColor="#ddd"
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {isEditing && (
            <ContactCardActionButton
              iconDimensions={20}
              iconColor="#999"
              backgroundColor="white"
              borderRadius={13}
              borderWidth={1}
              borderColor="#ddd"
              isDiscard={true}
              onEditPress={handleDiscardChanges}
            />
          )}
          <ContactCardActionButton
            iconDimensions={20}
            iconColor="#999"
            backgroundColor="white"
            borderRadius={13}
            borderWidth={1}
            borderColor="#ddd"
            isEditing={isEditing}
            onEditPress={handleEditToggle}
          />
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
        <Animated.View
          style={[
            {
              borderWidth: 1,
              borderColor: "#ddd",
              marginBottom: 20,
              justifyContent: "center",
            },
            nameContainerAnimatedStyle,
          ]}
        >
          {isEditing ? (
            <View style={{ flexDirection: "column", gap: 10 }}>
              <TextInput
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                  color: "#000",
                }}
                value={editData.first_name || ""}
                onChangeText={(value) => updateEditData("first_name", value)}
                placeholder="First name"
              />
              <TextInput
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                  color: "#000",
                  textAlign: "left",
                }}
                value={editData.last_name || ""}
                onChangeText={(value) => updateEditData("last_name", value)}
                placeholder="Last name"
              />
            </View>
          ) : (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: "#000",
              }}
            >
              {contact?.first_name} {contact?.last_name}
            </Text>
          )}
        </Animated.View>

        <Badge
          title="info"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={5}
        />

        <Animated.View
          style={[
            {
              borderWidth: 1,
              borderColor: "#E9E9E9",
              marginBottom: 20,
            },
            notesContainerAnimatedStyle,
          ]}
        >
          <View>
            {isEditing ? (
              <TextInput
                style={{
                  fontSize: 16,
                  color: "#000",
                  lineHeight: 22,
                  minHeight: 60,
                  textAlignVertical: "top",
                  fontWeight: "600",
                }}
                value={editData.notes || ""}
                onChangeText={(value) => updateEditData("notes", value)}
                placeholder="Notes"
                multiline
              />
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  color: "#000",
                  lineHeight: 22,
                }}
              >
                {contact?.notes || ""}
              </Text>
            )}
          </View>
        </Animated.View>

        {interactions.length > 0 && (
          <>
            <Badge
              title="interactions"
              color="#E9E9E9"
              textColor="#000"
              textSize={14}
              marginBottom={5}
            />

            <View style={{ gap: 10 }}>
              {interactions.map((interaction) => (
                <InteractionItem
                  key={interaction.id}
                  interaction={interaction}
                />
              ))}
            </View>
          </>
        )}

        {isEditing && (
          <View
            style={{
              marginTop: 30,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <Pressable
              style={{
                backgroundColor: "#fff",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#ddd",
                alignItems: "center",
                elevation: 5,
                width: "30%",
              }}
              onPress={handleDeleteContact}
            >
              <Text
                style={{
                  color: "#111",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                delete
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
