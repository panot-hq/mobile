//import { useTalkAboutThem } from "@/contexts/TalkAboutThemContext";
//import { useRef } from "react";
import { View } from "react-native";
import SettingsButton from "./SettingsButton";

export default function PresentActionBar() {
  //const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  //const { isOverlayVisible } = useTalkAboutThem();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        width: "100%",
        paddingHorizontal: 25,
        marginTop: 68,
      }}
    >
      <SettingsButton />
      {/*<NewContactButton
        onPress={() => bottomSheetModalRef.current?.present()}
      />
      <AddContactModal
        bottomSheetModalRef={
          bottomSheetModalRef as React.RefObject<BottomSheetModal>
        }
      />*/}
    </View>
  );
}
