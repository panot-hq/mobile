import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import React, { ReactNode } from "react";
import { Text, View } from "react-native";
import BaseButton from "../ui/BaseButton";

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  showBorder?: boolean;
}

export default function SettingItem({
  title,
  subtitle,
  icon,
  onPress,
  rightElement,
  showBorder = true,
}: SettingItemProps) {
  return (
    <BaseButton
      onPress={onPress || (() => {})}
      backgroundColor="transparent"
      style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {icon &&
          (icon === "sign-out" ? (
            <Octicons
              name="sign-out"
              size={18}
              color="#CCCCCC"
              style={{ marginRight: 16, transform: [{ rotate: "180deg" }] }}
            />
          ) : (
            <MaterialIcons
              name={icon as any}
              size={20}
              color="#CCCCCC"
              style={{ marginRight: 16 }}
            />
          ))}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "300",
              color: "#FFFFFF",
              marginBottom: subtitle ? 2 : 0,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                color: "#CCCCCC",
                fontWeight: "200",
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        <MaterialIcons name="chevron-right" size={20} color="#666666" />
      )}
    </BaseButton>
  );
}
