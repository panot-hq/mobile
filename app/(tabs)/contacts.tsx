import ContactList from "@/components/contacts/ContactList";
import ContactsActionBar from "@/components/contacts/ContactsActionBar";
import { useTalkAboutThem } from "@/contexts/TalkAboutThemContext";
import { useState } from "react";
import { View } from "react-native";

export default function TabThreeScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { shouldBlur } = useTalkAboutThem();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
    >
      {!shouldBlur && (
        <View style={{ paddingTop: 68 }}>
          <ContactsActionBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </View>
      )}
      <ContactList searchTerm={searchTerm} />
    </View>
  );
}
