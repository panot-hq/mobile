import { View } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";

interface NewContactCloseButtonProps {
  onClose?: () => void;
}

export default function NewContactCloseButton({
  onClose,
}: NewContactCloseButtonProps) {
  return (
    <View style={{ position: "absolute", top: 25, right: 25, zIndex: 1000 }}>
      <Pressable
        onPressIn={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onPress={() => {
          if (onClose) {
            onClose();
          }
        }}
      >
        <AntDesign name="close" size={20} color="#000" />
      </Pressable>
    </View>
  );
}
