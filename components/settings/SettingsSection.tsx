import React, { ReactNode } from "react";
import { View } from "react-native";
import Badge from "../ui/Badge";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  return (
    <View style={{ marginBottom: 32 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        {title && (
          <Badge
            title={title}
            color="#333333"
            textColor="#FFFFFF"
            textSize={14}
            marginBottom={0}
          />
        )}
      </View>
      <View
        style={{
          backgroundColor: "#1A1A1A",
          borderRadius: 16,
          marginHorizontal: 20,
          borderWidth: 1,
          borderColor: "#000",
        }}
      >
        {children}
      </View>
    </View>
  );
}
