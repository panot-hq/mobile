import AddContactModal from "@/components/contacts/AddContactModal";
import ContactsSearchBar from "@/components/contacts/ContactsSearchBar";
import NewContactButton from "@/components/contacts/NewContactButton";
import { useTalkAboutThem } from "@/contexts/TalkAboutThemContext";
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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { isOverlayVisible } = useTalkAboutThem();

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    buttonOpacity.value = withSpring(0);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    buttonOpacity.value = withSpring(1);
  };

  const handleAddContact = () => {
    // Only open modal if overlay is not visible
    if (!isOverlayVisible) {
      bottomSheetModalRef.current?.present();
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        top: 68,
        width: "100%",
        gap: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <ContactsSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
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
