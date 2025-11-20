import { ExistingContact } from "expo-contacts";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import BaseButton, { BaseButtonProps } from "../ui/BaseButton";

interface LocalContactListItem {
  type: "header" | "contact";
  letter?: string;
  contact?: ExistingContact;
}

interface LocalContactListElementProps
  extends Omit<BaseButtonProps, "children" | "onPress"> {
  item: LocalContactListItem;
  onPress?: () => void;
}

const LocalContactListElement = React.memo(function LocalContactListElement({
  item,
  onPress,
  ...baseButtonProps
}: LocalContactListElementProps) {
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

    const firstName = contact.firstName || "";
    const lastName = contact.lastName || "";
    const displayName =
      `${firstName} ${lastName}`.trim() || contact.name || "Sin nombre";

    let phoneNumber = "";
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const mobilePhone = contact.phoneNumbers.find(
        (phone) =>
          phone.label?.toLowerCase().includes("mobile") ||
          phone.label?.toLowerCase().includes("móvil")
      );
      phoneNumber =
        mobilePhone?.number || contact.phoneNumbers[0]?.number || "";
    }

    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        layout={LinearTransition.springify()}
      >
        <BaseButton
          onPress={onPress || (() => {})}
          {...baseButtonProps}
          style={{
            flex: 1,
            alignItems: "flex-start",
            backgroundColor: "#E9E9E9",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              gap: 5,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#000",
                marginBottom: phoneNumber ? 4 : 2,
              }}
            >
              {displayName}
            </Text>
            {/* <Text
              style={{
                fontSize: 14,
                color: "#888",
              }}
            >
              {phoneNumber ? phoneNumber : "No phone number"}
            </Text>*/}
          </View>
        </BaseButton>
      </Animated.View>
    );
  }

  return null;
});

export default LocalContactListElement;
