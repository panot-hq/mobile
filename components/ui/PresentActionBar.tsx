import { View } from "react-native";
import SettingsButton from "./SettingsButton";

export default function PresentActionBar() {
  return (
    <View
      style={{
        position: "absolute",
        top: 68,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        width: "100%",

        paddingHorizontal: 25,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {/*   <Badge title="other actions" color="#eee" textColor="#000" /> */}
      </View>
      <SettingsButton />
    </View>
  );
}
