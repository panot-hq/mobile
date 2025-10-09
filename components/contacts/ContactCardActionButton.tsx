import Feather from "@expo/vector-icons/Feather";
import React from "react";
import BaseButton, { BaseButtonProps } from "../ui/BaseButton";

interface ContactCardActionButtonProps
  extends Omit<BaseButtonProps, "children" | "onPress"> {
  iconDimensions?: number;
  iconColor?: string;
  orientation?: "right" | "left";
  borderWidth?: number;
  borderColor?: string;
  isEditing?: boolean;
  onEditPress?: () => void;
  isDiscard?: boolean;
}

export default function ContactCardActionButton({
  iconDimensions = 20,
  iconColor = "#999",
  orientation = "right",
  borderWidth = 0,
  borderColor = "transparent",
  backgroundColor = "white",
  borderRadius = 13,
  isEditing = false,
  onEditPress,
  isDiscard = false,
  ...props
}: ContactCardActionButtonProps) {
  const handlePress = () => {
    if (onEditPress) {
      onEditPress();
    }
  };

  return (
    <BaseButton
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      borderColor={borderColor}
      onPress={handlePress}
      {...props}
    >
      <Feather
        name={isDiscard ? "x" : isEditing ? "check" : "edit-3"}
        size={iconDimensions}
        color={iconColor}
      />
    </BaseButton>
  );
}
