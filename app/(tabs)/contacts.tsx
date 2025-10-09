import ContactList from "@/components/contacts/ContactList";
import ContactsActionBar from "@/components/contacts/ContactsActionBar";
import { View } from "react-native";

export default function TabThreeScreen() {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
    >
      <View style={{ paddingTop: 68 }}>
        <ContactsActionBar />
      </View>
      <ContactList />
    </View>
  );
}
