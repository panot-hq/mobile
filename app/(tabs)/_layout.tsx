import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SceneMap, TabView } from "react-native-tab-view";

import TabOneScreen from "./index";
import TabThreeScreen from "./three";
import TabTwoScreen from "./two";

const renderScene = SceneMap({
  first: TabOneScreen,
  second: TabTwoScreen,
  third: TabThreeScreen,
});

interface AnimatedCircleProps {
  isFocused: boolean;
  onPress: () => void;
}

function AnimatedCircle({ isFocused, onPress }: AnimatedCircleProps) {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.3 : 1, {
      damping: 30,
      stiffness: 150,
    });

    colorProgress.value = withSpring(isFocused ? 1 : 0, {
      damping: 30,
      stiffness: 150,
    });
  }, [isFocused, scale, colorProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorProgress.value,
      [0, 1],
      ["#A7A7A7", "#000"]
    );

    return {
      transform: [{ scale: scale.value }],
      color,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.Text style={animatedStyle}>
        <FontAwesome name="circle" size={11} />
      </Animated.Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "First" },
    { key: "second", title: "Second" },
    { key: "third", title: "Third" },
  ]);

  const renderTabBar = (props: any) => (
    <View
      style={{
        position: "absolute",
        bottom: 90,
        left: "50%",
        transform: [{ translateX: "-50%" }],
        borderRadius: 30,
        elevation: 8,
        width: 70,
        zIndex: 1000,
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          backgroundColor: "#EFEFEF",
          height: 25,
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          paddingHorizontal: 8,
          borderRadius: 30,
        }}
      >
        {props.navigationState.routes.map((route: any, index: number) => {
          const isFocused = props.navigationState.index === index;

          const onPress = () => {
            props.jumpTo(route.key);
          };

          return (
            <AnimatedCircle
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      swipeEnabled={true}
      animationEnabled={true}
      style={{ backgroundColor: "#fff" }}
    />
  );
}
