import ContactCardActionButton from "@/components/contacts/ContactCardActionButton";
import Badge from "@/components/ui/Badge";
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
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function InteractionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { triggerRefresh } = useInteraction();
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Interaction>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const fetchContact = async (contactId: string) => {
    const { data, error } = await ContactsService.getById(contactId);
    if (data) {
      setContact(data);
    }
    if (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await InteractionsService.getById(id as string);
      if (data) {
        setInteraction(data);
        setEditData(data);
        // Solo buscar el contacto si tenemos un contact_id válido
        if (data.contact_id) {
          await fetchContact(data.contact_id);
        }
      }
      if (error) {
        console.error(error);
      }
    };

    loadData();
  }, [id]);

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (interaction && hasChanges) {
      try {
        const { data, error } = await InteractionsService.update(
          interaction.id,
          editData
        );
        if (data) {
          setInteraction(data);
          setIsEditing(false);
          setHasChanges(false);
          triggerRefresh();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (error) {
          console.error("Error updating interaction:", error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (error) {
        console.error("Error updating interaction:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      setIsEditing(false);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    setEditData(interaction || {});
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
            setEditData(interaction || {});
            setIsEditing(false);
            setHasChanges(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      );
    }
  };

  const handleDeleteInteraction = () => {
    if (!interaction) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Eliminar Interacción"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "Eliminar Interacción",
        message:
          "¿Estás seguro de que quieres eliminar esta interacción? Esta acción no se puede deshacer.",
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            const { error } = await InteractionsService.delete(interaction.id);
            if (error) {
              console.error("Error deleting interaction:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "No se pudo eliminar la interacción");
            } else {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              triggerRefresh();
              router.back();
            }
          } catch (error) {
            console.error("Error deleting interaction:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "No se pudo eliminar la interacción");
          }
        }
      }
    );
  };

  const updateEditData = (field: keyof Interaction, value: string) => {
    setEditData((prev) => {
      const newData = { ...prev, [field]: value };
      if (interaction) {
        const hasChanges = Object.keys(newData).some(
          (key) =>
            newData[key as keyof Interaction] !==
            interaction[key as keyof Interaction]
        );
        setHasChanges(hasChanges);
      }
      return newData;
    });
  };

  const contentContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isEditing
      ? withTiming("white", { duration: 400 })
      : withTiming("rgba(245, 245, 245, 0.8)", { duration: 400 }),
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditing ? 1 : 0,
    borderColor: "#ddd",
  }));

  const conceptsContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isEditing
      ? withTiming("white", { duration: 400 })
      : withTiming("rgba(245, 245, 245, 0.8)", { duration: 400 }),
    borderRadius: 20,
    padding: 20,
    borderWidth: isEditing ? 1 : 0,
    borderColor: "#E9E9E9",
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", marginTop: -30 }}>
      <View
        style={{
          position: "absolute",
          top: 68,
          paddingHorizontal: 20,
          zIndex: 1000,
          flexDirection: "row",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
        }}
      >
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
        style={{ flex: 1, marginTop: -30 }}
        contentContainerStyle={{
          paddingTop: 120,
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Badge
          title="contenido"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={5}
        />

        <Animated.View
          style={[
            {
              borderWidth: 1,
              borderColor: "#ddd",
              marginBottom: 20,
              justifyContent: "center",
            },
            contentContainerAnimatedStyle,
          ]}
        >
          {isEditing ? (
            <TextInput
              style={{
                fontSize: 16,
                color: "#000",
                lineHeight: 22,
                minHeight: 100,
                textAlignVertical: "top",
                fontWeight: "400",
              }}
              value={editData.raw_content || ""}
              onChangeText={(value) => updateEditData("raw_content", value)}
              placeholder="Contenido de la interacción"
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
              {interaction?.raw_content || ""}
            </Text>
          )}
        </Animated.View>

        <Badge
          title="conceptos clave"
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
            conceptsContainerAnimatedStyle,
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
                value={editData.key_concepts || ""}
                onChangeText={(value) => updateEditData("key_concepts", value)}
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
                {interaction?.key_concepts || "Sin conceptos clave"}
              </Text>
            )}
          </View>
        </Animated.View>

        <Badge
          title="información"
          color="#E9E9E9"
          textColor="#000"
          textSize={14}
          marginBottom={5}
        />

        <View
          style={{
            backgroundColor: "rgba(245, 245, 245, 0.8)",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 5,
            }}
          >
            Fecha de creación
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#000",
              fontWeight: "500",
            }}
          >
            {formatCreatedAt(interaction?.created_at as string)}
          </Text>
        </View>

        {contact && (
          <View
            style={{
              backgroundColor: "rgba(245, 245, 245, 0.8)",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E9E9E9",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 5,
              }}
            >
              Contacto asociado
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#000",
                fontWeight: "500",
              }}
            >
              {contact.first_name} {contact.last_name}
            </Text>
          </View>
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
              onPress={handleDeleteInteraction}
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
