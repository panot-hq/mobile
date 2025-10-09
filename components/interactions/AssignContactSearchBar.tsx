import { useContacts } from "@/contexts/ContactsContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, View } from "react-native";

interface AssignContactSearchBarProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function AssignContactSearchBar({
  onFocus,
  onBlur,
}: AssignContactSearchBarProps) {
  const { searchTerm, setSearchTerm } = useContacts();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E9E9E9",
        borderRadius: 13,
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 40,
        flex: 1,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}
      >
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search "
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1,
            fontSize: 16,
            color: "#000",
            paddingVertical: 4,
          }}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
}
