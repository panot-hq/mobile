import PanotSpeechModule from "panot-speech";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AudioVisualizerProps {
  barCount?: number;
  color?: string;
  maxHeight?: number;
}

function AudioBar({
  height,
  color,
  maxHeight,
}: {
  height: { value: number };
  color: string;
  maxHeight: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: (height.value as number) * maxHeight,
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 3,
          backgroundColor: color,
          borderRadius: 1.5,
          minHeight: 2,
        },
      ]}
    />
  );
}

export default function AudioVisualizer({
  barCount = 50,
  color = "#000",
  maxHeight = 80,
}: AudioVisualizerProps) {
  const bar1 = useSharedValue(0.1);
  const bar2 = useSharedValue(0.1);
  const bar3 = useSharedValue(0.1);
  const bar4 = useSharedValue(0.1);
  const bar5 = useSharedValue(0.1);
  const bar6 = useSharedValue(0.1);
  const bar7 = useSharedValue(0.1);
  const bar8 = useSharedValue(0.1);
  const bar9 = useSharedValue(0.1);
  const bar10 = useSharedValue(0.1);
  const bar11 = useSharedValue(0.1);
  const bar12 = useSharedValue(0.1);
  const bar13 = useSharedValue(0.1);
  const bar14 = useSharedValue(0.1);
  const bar15 = useSharedValue(0.1);
  const bar16 = useSharedValue(0.1);
  const bar17 = useSharedValue(0.1);
  const bar18 = useSharedValue(0.1);
  const bar19 = useSharedValue(0.1);
  const bar20 = useSharedValue(0.1);
  const bar21 = useSharedValue(0.1);
  const bar22 = useSharedValue(0.1);
  const bar23 = useSharedValue(0.1);
  const bar24 = useSharedValue(0.1);
  const bar25 = useSharedValue(0.1);
  const bar26 = useSharedValue(0.1);
  const bar27 = useSharedValue(0.1);
  const bar28 = useSharedValue(0.1);
  const bar29 = useSharedValue(0.1);
  const bar30 = useSharedValue(0.1);
  const bar31 = useSharedValue(0.1);
  const bar32 = useSharedValue(0.1);
  const bar33 = useSharedValue(0.1);
  const bar34 = useSharedValue(0.1);
  const bar35 = useSharedValue(0.1);
  const bar36 = useSharedValue(0.1);
  const bar37 = useSharedValue(0.1);
  const bar38 = useSharedValue(0.1);
  const bar39 = useSharedValue(0.1);
  const bar40 = useSharedValue(0.1);
  const bar41 = useSharedValue(0.1);
  const bar42 = useSharedValue(0.1);
  const bar43 = useSharedValue(0.1);
  const bar44 = useSharedValue(0.1);
  const bar45 = useSharedValue(0.1);
  const bar46 = useSharedValue(0.1);
  const bar47 = useSharedValue(0.1);
  const bar48 = useSharedValue(0.1);
  const bar49 = useSharedValue(0.1);
  const bar50 = useSharedValue(0.1);

  const allBarHeights = [
    bar1,
    bar2,
    bar3,
    bar4,
    bar5,
    bar6,
    bar7,
    bar8,
    bar9,
    bar10,
    bar11,
    bar12,
    bar13,
    bar14,
    bar15,
    bar16,
    bar17,
    bar18,
    bar19,
    bar20,
    bar21,
    bar22,
    bar23,
    bar24,
    bar25,
    bar26,
    bar27,
    bar28,
    bar29,
    bar30,
    bar31,
    bar32,
    bar33,
    bar34,
    bar35,
    bar36,
    bar37,
    bar38,
    bar39,
    bar40,
    bar41,
    bar42,
    bar43,
    bar44,
    bar45,
    bar46,
    bar47,
    bar48,
    bar49,
    bar50,
  ];

  const activeBars = useMemo(
    () => allBarHeights.slice(0, Math.min(barCount, 50)),
    [barCount]
  );

  useEffect(() => {
    let lastTime = Date.now();

    const sub = PanotSpeechModule.addListener("onVolumeChange", (event) => {
      const normalized = (event.volume + 2) / 12;
      const currentTime = Date.now();

      activeBars.forEach((height, index) => {
        const phase = (index / barCount) * Math.PI * 2;
        const variation = Math.sin(phase + currentTime / 200);
        const baseHeight = normalized * 0.8 + 0.1;
        const finalHeight = baseHeight + variation * normalized * 0.3;
        const clampedHeight = Math.max(0.1, Math.min(0.95, finalHeight));

        height.value = withSpring(clampedHeight, {
          damping: 15,
          stiffness: 100,
        });
      });

      lastTime = currentTime;
    });

    return () => {
      sub.remove();
    };
  }, [activeBars, barCount]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 3,
      }}
    >
      {activeBars.map((height, index) => (
        <AudioBar
          key={index}
          height={height}
          color={color}
          maxHeight={maxHeight}
        />
      ))}
    </View>
  );
}
