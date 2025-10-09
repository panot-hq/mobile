import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import BaseButton, { BaseButtonProps } from "../ui/BaseButton";

interface NewContactButtonProps extends Omit<BaseButtonProps, "children"> {}
const BUTON_SIZE = 40;

export default function NewContactButton({
  backgroundColor = "#E9E9E9",
  width = BUTON_SIZE,
  height = BUTON_SIZE,
  borderRadius = 13,
  hapticFeedback = Haptics.ImpactFeedbackStyle.Medium,
  ...props
}: NewContactButtonProps) {
  return (
    <BaseButton
      backgroundColor={backgroundColor}
      width={width}
      height={height}
      borderRadius={borderRadius}
      {...props}
    >
      <MaterialIcons name="add" size={20} color="#757575" />
    </BaseButton>
  );
}
