import TalkAboutThemOverlay from "@/components/contacts/TalkAboutThemOverlay";
import TabBar from "@/components/navigation/TabBar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import { useTalkAboutThem } from "@/contexts/TalkAboutThemContext";
import React, { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import TabThreeScreen from "./contacts";
import TabTwoScreen from "./present";

const renderScene = SceneMap({
  second: TabTwoScreen,
  third: TabThreeScreen,
});

export default function TabLayout() {
  const { isSyncing } = useAuth();
  const { isRecording, shouldBlur, isListExpanded } = useRecording();
  const { shouldBlur: shouldBlurTalkAboutThem } = useTalkAboutThem();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "second", title: "Second" },
    { key: "third", title: "Third" },
  ]);

  const renderTabBar = (props: any) => {
    if (shouldBlur || shouldBlurTalkAboutThem) {
      return null; // Hide TabBar completely when blur is active
    }

    return (
      <TabBar
        navigationState={props.navigationState}
        jumpTo={props.jumpTo}
        disabled={isRecording}
        shouldBlur={shouldBlur}
        isListExpanded={isListExpanded}
      />
    );
  };

  if (isSyncing) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={!isRecording && !shouldBlur && !shouldBlurTalkAboutThem}
        animationEnabled={true}
        style={{ backgroundColor: "#fff" }}
      />
      <TalkAboutThemOverlay />
    </View>
  );
}
