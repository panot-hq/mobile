import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import BaseButton from "./BaseButton";

interface SettingsButtonProps {}

export default function SettingsButton({}: SettingsButtonProps) {
  return (
    <BaseButton
      onPress={() => router.push("/settings")}
      backgroundColor="#E9E9E9"
    >
      <MaterialIcons name="settings" size={14} color="#000" />
    </BaseButton>
  );
}
