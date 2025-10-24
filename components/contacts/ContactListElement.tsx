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
    if (item.type === "contact" && item.contact) {
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
      contact.company ||
      "Sin nombre";

    const hasSearchTerm = searchTerm.trim().length > 0;
    const showDetails = hasSearchTerm && (contact.company || contact.job_title);

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
          }}
        >
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
                marginBottom: showDetails ? 4 : 2,
              }}
            >
              {displayName}
            </Text>
            {showDetails && (
              <View>
                {contact.company && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: contact.job_title ? 2 : 0,
                    }}
                  >
                    {contact.company}
                  </Text>
                )}
                {contact.job_title && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#888",
                      fontStyle: "italic",
                    }}
                  >
                    {contact.job_title}
                  </Text>
                )}
              </View>
            )}
          </View>
        </BaseButton>
      </Animated.View>
    );
  }

  return null;
}
