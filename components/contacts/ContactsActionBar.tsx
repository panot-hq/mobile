import AddContactModal from "@/components/contacts/AddContactModal";
import ContactsSearchBar from "@/components/contacts/ContactsSearchBar";
import NewContactButton from "@/components/contacts/NewContactButton";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ContactsActionBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function ContactsActionBar({
  searchTerm,
  setSearchTerm,
}: ContactsActionBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const buttonOpacity = useSharedValue(1);
  const buttonWidth = useSharedValue(45);
  const gapWidth = useSharedValue(12);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    buttonOpacity.value = withSpring(0);
    buttonWidth.value = withSpring(0);
    gapWidth.value = withSpring(0);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    buttonOpacity.value = withSpring(1);
    buttonWidth.value = withSpring(45);
    gapWidth.value = withSpring(12);
  };

  const handleAddContact = () => {
    bottomSheetModalRef.current?.present();
  };

  const gapAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: gapWidth.value,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: buttonWidth.value,
      opacity: buttonOpacity.value,
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        top: 68,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
        zIndex: 1000,
      }}
    >
      <ContactsSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
      <Animated.View style={gapAnimatedStyle} />
      <Animated.View style={[buttonAnimatedStyle]}>
        <NewContactButton onPress={handleAddContact} />
      </Animated.View>

      <AddContactModal
        bottomSheetModalRef={
          bottomSheetModalRef as React.RefObject<BottomSheetModal>
        }
      />
    </View>
  );
}
