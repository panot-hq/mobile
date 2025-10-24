import TabBar from "@/components/navigation/TabBar";
import { useRecording } from "@/contexts/RecordingContext";
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
  const { isRecording, shouldBlur, isListExpanded } = useRecording();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "second", title: "Second" },
    { key: "third", title: "Third" },
  ]);

  const renderTabBar = (props: any) => {
    if (shouldBlur) {
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

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={!isRecording && !shouldBlur}
        animationEnabled={true}
        style={{ backgroundColor: "#fff" }}
      />
    </View>
  );
}
