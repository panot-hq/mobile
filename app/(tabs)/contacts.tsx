import ContactList from "@/components/contacts/ContactList";
import ContactsActionBar from "@/components/contacts/ContactsActionBar";
import { useState } from "react";
import { View } from "react-native";

export default function TabThreeScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
    >
      <View style={{ paddingTop: 68 }}>
        <ContactsActionBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </View>
      <ContactList searchTerm={searchTerm} />
    </View>
  );
}
