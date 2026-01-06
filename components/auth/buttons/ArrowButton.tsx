import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import BaseButton, { BaseButtonProps } from "../../ui/BaseButton";

interface ArrowButtonProps extends Omit<BaseButtonProps, "children"> {
  iconDimensions?: number;
  iconColor?: string;
  orientation?: "right" | "left";
  borderWidth?: number;
  borderColor?: string;
  settings?: boolean;
}

export default function ArrowButton({
  backgroundColor = "black",
  iconDimensions = 28,
  iconColor = "white",
  borderRadius = 13,
  orientation = "left",
  borderWidth = 0,
  borderColor = "transparent",
  settings = false,
  ...props
}: ArrowButtonProps) {
  return (
    <BaseButton
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      borderColor={borderColor}
      {...props}
    >
      {settings ? (
        <MaterialIcons
          name="keyboard-arrow-left"
          size={iconDimensions}
          color={iconColor}
        />
      ) : (
        <Feather
          name={orientation === "right" ? "arrow-right" : "arrow-left"}
          size={iconDimensions}
          color={iconColor}
        />
      )}
    </BaseButton>
  );
}
