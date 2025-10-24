import InteractionList from "@/components/interactions/InteractionColapsableList";
import RecordingOverlay from "@/components/recording/RecordingOverlay";
import PresentActionBar from "@/components/ui/PresentActionBar";

import { useRecording } from "@/contexts/RecordingContext";
import React, { useEffect } from "react";
import { View } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TabTwoScreen() {
  const { isListExpanded, setIsListExpanded } = useRecording();
  const recordButtonOpacity = useSharedValue(1);

  useEffect(() => {
    recordButtonOpacity.value = withTiming(isListExpanded ? 0 : 1, {
      duration: 300,
    });
  }, [isListExpanded, recordButtonOpacity]);

  const animatedRecordButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: recordButtonOpacity.value,
    };
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 25,
      }}
    >
      <PresentActionBar />

      <InteractionList onExpandedChange={setIsListExpanded} />
      <View
        style={{
          marginVertical: 30,
          height: 1,
          width: "80%",
        }}
      />

      <RecordingOverlay hideRecordButton={isListExpanded} />
    </View>
  );
}
