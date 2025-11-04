import { CommunicationChannel } from "@/lib/types/communicationChannel";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActionSheetIOS, Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface CommunicationChannelsProps {
  channels: CommunicationChannel[];
  onChannelsChange: (channels: CommunicationChannel[]) => void;
  editable?: boolean;
}

export default function CommunicationChannels({
  channels,
  onChannelsChange,
  editable = true,
}: CommunicationChannelsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [focusField, setFocusField] = useState<"type" | "value">("type");

  const handleEdit = (index: number, field: "type" | "value" = "type") => {
    setEditingIndex(index);
    setEditingType(channels[index].type);
    setEditingValue(channels[index].value);
    setFocusField(field);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveEdit = () => {
    if (isCancelling) {
      setIsCancelling(false);
      return;
    }
    if (editingIndex !== null && editingType.trim() && editingValue.trim()) {
      const updatedChannels = [...channels];
      updatedChannels[editingIndex] = {
        type: editingType.trim(),
        value: editingValue.trim(),
      };
      onChannelsChange(updatedChannels);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditingIndex(null);
    setEditingType("");
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setIsCancelling(true);
    setEditingIndex(null);
    setEditingType("");
    setEditingValue("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Reset the flag after a short delay
    setTimeout(() => setIsCancelling(false), 100);
  };

  const handleDelete = (index: number) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancelar", "Eliminar"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
        title: "¿Eliminar canal de comunicación?",
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          const updatedChannels = channels.filter((_, i) => i !== index);
          onChannelsChange(updatedChannels);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    );
  };

  const handleSaveNew = () => {
    if (isCancelling) {
      setIsCancelling(false);
      return;
    }
    if (newType.trim() && newValue.trim()) {
      const updatedChannels = [
        ...channels,
        { type: newType.trim(), value: newValue.trim() },
      ];
      onChannelsChange(updatedChannels);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewType("");
      setNewValue("");
    }
  };

  const handleClearNew = () => {
    setIsCancelling(true);
    setNewType("");
    setNewValue("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Reset the flag after a short delay
    setTimeout(() => setIsCancelling(false), 100);
  };

  const handleBlurNew = () => {
    if (isCancelling) {
      setIsCancelling(false);
      return;
    }
    if (newType.trim() && newValue.trim()) {
      handleSaveNew();
    }
  };

  // Si no hay canales, mostrar el pressable
  if (channels.length === 0) {
    return (
      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#E0E0E0",
          borderRadius: 12,
          backgroundColor: "#FFF",
        }}
      >
        <View
          style={{
            flex: 1,
            padding: 12,
            borderRightWidth: 1,
            borderRightColor: "#E0E0E0",
          }}
        >
          <TextInput
            style={{
              fontSize: 14,
              color: "#000",
            }}
            value={newType}
            onChangeText={setNewType}
            placeholder="Type"
            placeholderTextColor="#999"
          />
        </View>
        <View
          style={{
            flex: 2,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TextInput
            style={{
              fontSize: 14,
              color: "#000",
              flex: 1,
            }}
            value={newValue}
            onChangeText={setNewValue}
            placeholder="Value"
            placeholderTextColor="#999"
            onSubmitEditing={handleSaveNew}
            onBlur={handleBlurNew}
          />
          {(newType.trim() || newValue.trim()) && (
            <Pressable onPressIn={handleClearNew}>
              <Text style={{ color: "#999", fontSize: 14 }}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 0 }}>
      {channels.map((channel, index) => (
        <Animated.View
          key={index}
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderTopWidth: index === 0 ? 1 : 0,
            borderTopLeftRadius: index === 0 ? 12 : 0,
            borderTopRightRadius: index === 0 ? 12 : 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: editingIndex === index ? "#f0f0f0" : "#FFF",
          }}
        >
          {editingIndex === index ? (
            <>
              <View
                style={{
                  flex: 1,
                  padding: 12,
                  borderRightWidth: 1,
                  borderRightColor: "#E0E0E0",
                }}
              >
                <TextInput
                  style={{
                    fontSize: 14,
                    color: "#000",
                  }}
                  value={editingType}
                  onChangeText={setEditingType}
                  placeholder="Type"
                  autoFocus={focusField === "type"}
                />
              </View>
              <View
                style={{
                  flex: 2,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <TextInput
                  style={{
                    fontSize: 14,
                    color: "#000",
                    flex: 1,
                  }}
                  value={editingValue}
                  onChangeText={setEditingValue}
                  placeholder="Value"
                  autoFocus={focusField === "value"}
                  onBlur={handleSaveEdit}
                  onSubmitEditing={handleSaveEdit}
                />
                <Pressable onPressIn={handleCancelEdit}>
                  <Text style={{ color: "#999", fontSize: 14 }}>Cancel</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => editable && handleEdit(index, "type")}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRightWidth: 1,
                  borderRightColor: "#E0E0E0",
                }}
              >
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text style={{ fontSize: 14, color: "#000" }}>
                    {channel.type}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => editable && handleEdit(index, "value")}
                onLongPress={() => editable && handleDelete(index)}
                delayLongPress={500}
                style={{
                  flex: 2,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 14, color: "#000", flex: 1 }}>
                  {channel.value}
                </Text>
                {editable && (
                  <Pressable
                    onPress={() => handleDelete(index)}
                    style={{ padding: 4 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={{ color: "#000", fontSize: 16 }}>✕</Text>
                  </Pressable>
                )}
              </Pressable>
            </>
          )}
        </Animated.View>
      ))}

      {editable && (
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderTopWidth: channels.length === 0 ? 1 : 0,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            borderTopLeftRadius: channels.length === 0 ? 12 : 0,
            borderTopRightRadius: channels.length === 0 ? 12 : 0,
            backgroundColor: "#FFF",
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRightWidth: 1,
              borderRightColor: "#E0E0E0",
            }}
          >
            <TextInput
              style={{
                fontSize: 14,
                color: "#000",
              }}
              value={newType}
              onChangeText={setNewType}
              placeholder="Type"
              placeholderTextColor="#999"
            />
          </View>
          <View
            style={{
              flex: 2,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TextInput
              style={{
                fontSize: 14,
                color: "#000",
                flex: 1,
              }}
              value={newValue}
              onChangeText={setNewValue}
              placeholder="Value"
              placeholderTextColor="#999"
              onSubmitEditing={handleSaveNew}
              onBlur={handleBlurNew}
            />
            {(newType.trim() || newValue.trim()) && (
              <Pressable onPressIn={handleClearNew}>
                <Text style={{ color: "#999", fontSize: 14 }}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
