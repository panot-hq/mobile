import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import BaseButton from "../ui/BaseButton";
export default function CloseSettingsButton() {
  return (
    <BaseButton onPress={() => router.back()}>
      <AntDesign name="close" size={20} color="#fff" />
    </BaseButton>
  );
}
