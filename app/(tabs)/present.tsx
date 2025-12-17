import InteractionList from "@/components/interactions/InteractionColapsableList";
import RecordingOverlay from "@/components/recording/RecordingOverlay";
import ColapseButton from "@/components/ui/ColapseButton";
import PresentActionBar from "@/components/ui/PresentActionBar";

import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isListExpanded, setIsListExpanded } = useRecording();
  const recordButtonOpacity = useSharedValue(1);
  const [currentDayPeriod, setcurrentDayPeriod] = useState("morning");
  const { user } = useAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setcurrentDayPeriod("morning");
    } else if (hour < 18) {
      setcurrentDayPeriod("afternoon");
    } else {
      setcurrentDayPeriod("evening");
    }
  }, []);

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
        backgroundColor: "#fff",
        borderRadius: 25,
        overflow: "hidden",
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <PresentActionBar />

        <View
          style={{
            width: "100%",
            paddingHorizontal: 25,
            marginTop: 25,
            marginBottom: 25,
          }}
        >
          <Text
            style={{
              fontSize: 60,
              fontWeight: 300,
            }}
          >
            {t(`present.welcome_${currentDayPeriod}`)}{" "}
            {user?.user_metadata?.display_name.split(" ")[0]}
          </Text>
        </View>

        <InteractionList
          isExpanded={isListExpanded}
          onExpandedChange={setIsListExpanded}
        />
        <View
          style={{
            marginVertical: 30,
            height: 1,
            width: "80%",
          }}
        />
      </ScrollView>

      {isListExpanded && (
        <ColapseButton setIsListExpanded={setIsListExpanded} />
      )}

      <RecordingOverlay hideRecordButton={isListExpanded} />
    </View>
  );
}
