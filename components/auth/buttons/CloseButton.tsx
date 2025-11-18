import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import BaseButton, { BaseButtonProps } from "../../ui/BaseButton";

interface CloseButtonProps extends Omit<BaseButtonProps, "children"> {
  iconDimensions?: number;
  iconColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

export default function CloseButton({
  backgroundColor = "black",
  iconDimensions = 28,
  iconColor = "white",
  borderRadius = 13,
  borderWidth = 0,
  borderColor = "transparent",
  ...props
}: CloseButtonProps) {
  return (
    <BaseButton
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      borderColor={borderColor}
      {...props}
    >
      <AntDesign name="close" size={iconDimensions} color={iconColor} />
    </BaseButton>
  );
}
