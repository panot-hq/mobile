import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";

interface ImportContactSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function ImportContactSearchBar({
  searchTerm,
  setSearchTerm,
  onFocus,
  onBlur,
}: ImportContactSearchBarProps) {
  const { t } = useTranslation();

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
          placeholder={t("contacts.import.search_placeholder")}
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
