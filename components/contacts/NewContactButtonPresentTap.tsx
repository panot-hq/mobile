import * as Haptics from "expo-haptics";
import { Text } from "react-native";
import BaseButton, { BaseButtonProps } from "../ui/BaseButton";

interface NewContactButtonProps extends Omit<BaseButtonProps, "children"> {}

export default function NewContactButton({
  backgroundColor = "#000",
  borderRadius = 15,
  hapticFeedback = Haptics.ImpactFeedbackStyle.Medium,
  ...props
}: NewContactButtonProps) {
  return (
    <BaseButton
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      {...props}
    >
      <Text style={{ fontSize: 14, color: "#FFF", paddingHorizontal: 10 }}>
        New contact
      </Text>
    </BaseButton>
  );
}
