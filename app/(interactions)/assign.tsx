import AssignContactSearchBar from "@/components/interactions/AssignContactSearchBar";
import AssignContactsList from "@/components/interactions/AssignContactsList";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function AssignInteractionScreen() {
  const { interactionId, mode } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          position: "absolute",
          top: 25,
          marginHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          zIndex: 1000,
        }}
      >
        <AssignContactSearchBar />
      </View>
      <View
        style={{
          height: "100%",
          position: "absolute",
          top: -50,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <AssignContactsList
          interactionId={interactionId as string | undefined}
          isRecordingMode={mode === "recording"}
        />
      </View>
    </View>
  );
}
