import * as Haptics from "expo-haptics";
import { Text } from "react-native";
import BaseButton, { BaseButtonProps } from "../ui/BaseButton";

interface AssignInteractionButtonProps
  extends Omit<BaseButtonProps, "children"> {}

export default function NewContactButton({
  backgroundColor = "#E9E9E9",
  width = 100,
  height = 45,
  borderRadius = 13,
  hapticFeedback = Haptics.ImpactFeedbackStyle.Medium,
  ...props
}: AssignInteractionButtonProps) {
  return (
    <BaseButton
      backgroundColor={backgroundColor}
      width={width}
      height={height}
      borderRadius={borderRadius}
      {...props}
    >
      <Text>ASSIGN</Text>
    </BaseButton>
  );
}
