import React from "react";
import { Text, View } from "react-native";
import BaseButton, { BaseButtonProps } from "../../ui/BaseButton";

interface AuthButtonProps extends Omit<BaseButtonProps, "children"> {
  title?: string;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

export default function AuthButton({
  title,
  variant = "primary",
  width,
  height = 80,
  icon,
  ...props
}: AuthButtonProps) {
  const isPrimary = variant === "primary";

  const shadowStyle = isPrimary
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
      }
    : {};

  return (
    <BaseButton
      width={width}
      height={height}
      borderRadius={42}
      backgroundColor={isPrimary ? "black" : "#E9E9E9"}
      style={shadowStyle}
      {...props}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* <Ionicons
        //   name="exit-outline"
        //   size={24}
        //   color={isPrimary ? "white" : "#fff"}
        // />*/}
        {icon ? icon : null}
        <Text
          style={{
            fontFamily: "System",
            fontWeight: "300",
            color: isPrimary ? "white" : "#696969",
            fontSize: isPrimary ? 23 : 21,
          }}
        >
          {title}
        </Text>
      </View>
    </BaseButton>
  );
}
