import React from "react";
import { Text } from "react-native";
import BaseButton, { BaseButtonProps } from "../../ui/BaseButton";

interface EmailButtonProps extends Omit<BaseButtonProps, "children"> {
  title?: string;
}

export default function EmailButton({
  title,
  width = 334,
  height = 45,
  ...props
}: EmailButtonProps) {
  return (
    <BaseButton
      width={width}
      height={height}
      borderRadius={13}
      backgroundColor="#E9E9E9"
      {...props}
    >
      <Text
        style={{
          fontFamily: "System",
          fontWeight: "500",
          color: "#696969",
          fontSize: 17,
        }}
      >
        {title}
      </Text>
    </BaseButton>
  );
}
