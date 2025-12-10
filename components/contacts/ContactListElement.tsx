import { Shimmer } from "@/components/ui/Shimmer";
import { Contact } from "@/lib/database/database.types";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import BaseButton, { BaseButtonProps } from "../ui/BaseButton";

interface ContactListItem {
  type: "header" | "contact";
  letter?: string;
  contact?: Contact;
  hasDetailsSummary?: boolean;
}

interface ContactListElementProps
  extends Omit<BaseButtonProps, "children" | "onPress"> {
  item: ContactListItem;
  searchTerm: string;
  onPress?: () => void;
}

export default function ContactListElement({
  item,
  searchTerm,
  ...baseButtonProps
}: ContactListElementProps) {
  const handlePress = () => {
    if (item.type === "contact" && item.contact && item.hasDetailsSummary) {
      router.push(`/(contacts)/${item.contact.id}`);
    }
  };

  if (item.type === "header") {
    return (
      <View style={{ paddingVertical: 8, paddingTop: 20 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#000",
            marginBottom: 8,
          }}
        >
          {item.letter}
        </Text>
      </View>
    );
  }

  if (item.contact) {
    const contact = item.contact;
    const displayName =
      `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
      "Sin nombre";

    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        layout={LinearTransition.springify()}
      >
        <BaseButton
          onPress={handlePress}
          {...baseButtonProps}
          style={{
            flex: 1,
            alignItems: "flex-start",
            backgroundColor: "#E9E9E9",
            marginBottom: 8,
            overflow: "hidden",
          }}
        >
          {!item.hasDetailsSummary && <Shimmer />}
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#000",
                marginBottom: 2,
              }}
            >
              {displayName}
            </Text>
          </View>
        </BaseButton>
      </Animated.View>
    );
  }

  return null;
}
