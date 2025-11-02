import Badge from "@/components/ui/Badge";
import { useInteractions } from "@/lib/hooks/useLegendState";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import InteractionComponent from "./InteractionComponent";
const { height: screenHeight } = Dimensions.get("window");

interface InteractionListProps {
  onExpandedChange?: (isExpanded: boolean) => void;
}

export default function InteractionList({
  onExpandedChange,
}: InteractionListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { unassignedInteractions: rawInteractions } = useInteractions();

  const expandedValue = useSharedValue(0);

  const interactions = useMemo(() => {
    return [...rawInteractions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [rawInteractions]);

  useEffect(() => {
    if (isExpanded && interactions.length === 0) {
      setIsExpanded(false);
      onExpandedChange?.(false);
    }
  }, [interactions.length, isExpanded, onExpandedChange]);

  useEffect(() => {
    if (interactions.length === 0) {
      expandedValue.value = 0;
    } else {
      expandedValue.value = withSpring(isExpanded ? 1 : 0, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [isExpanded, interactions.length]);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  const stackedAnimatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: interpolate(
        expandedValue.value,
        [0, 1],
        [200, screenHeight * 0.9],
        Extrapolate.CLAMP
      ),
    };
  });

  const renderStackedInteractions = () => {
    const maxVisible = 3;
    const visibleInteractions = interactions.slice(0, maxVisible);

    return (
      <Pressable onPress={toggleExpanded} style={{ position: "relative" }}>
        {visibleInteractions.map((interaction, index) => {
          const isLast = index === visibleInteractions.length - 1;
          const offset = index * 8;
          const scale = 1 - index * 0.05;

          return (
            <Animated.View
              key={interaction.id}
              style={{
                position: index === 0 ? "relative" : "absolute",
                top: index === 0 ? 0 : offset,
                left: 0,
                right: 0,
                transform: [{ scale }],
                zIndex: maxVisible - index,
              }}
              entering={FadeIn.delay(index * 80)
                .duration(500)
                .springify()}
              layout={LinearTransition.springify()}
            >
              {index === 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -3,
                    right: 0,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#FF5117",
                    zIndex: 10,
                  }}
                />
              )}
              <View
                style={{
                  padding: 20,
                  borderRadius: 25,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  backgroundColor: "white",
                  gap: 10,
                  position: "relative",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 13 }}>
                    {new Date(
                      interaction.created_at || new Date()
                    ).toLocaleDateString()}
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    {new Date(
                      interaction.created_at || new Date()
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 12,
                  }}
                >
                  {interaction.raw_content.length > 30
                    ? interaction.raw_content.substring(0, 30) + "..."
                    : interaction.raw_content}
                </Text>
                {isLast && interactions.length > maxVisible && (
                  <Text
                    style={{
                      color: "#999",
                      fontSize: 10,
                      textAlign: "center",
                      marginTop: 18,
                    }}
                  >
                    +{interactions.length - maxVisible} more interactions
                  </Text>
                )}
              </View>
            </Animated.View>
          );
        })}
      </Pressable>
    );
  };

  return (
    <View
      style={{ flex: 1, padding: 10, marginTop: 100, gap: 25, width: "93%" }}
    >
      <Badge title="capture dock" color="#eee" textColor="#000" />

      {interactions.length === 0 ? (
        <View
          style={{
            flex: 1,
            paddingBottom: 10,
            marginBottom: -100,
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              color: "#ccc",
              fontSize: 10,
              textAlign: "center",
              width: "60%",
            }}
          >
            no interactions registered today, go on and register one, remember,
            the world is yours
          </Text>
        </View>
      ) : (
        <Animated.View
          style={[
            {
              flex: 1,
              paddingBottom: 10,
              marginBottom: -100,
            },
            stackedAnimatedStyle,
          ]}
        >
          {!isExpanded && renderStackedInteractions()}

          {isExpanded && (
            <FlatList
              data={interactions}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: 10,
                paddingTop: 10,
                paddingBottom: 120,
                paddingHorizontal: 8,
              }}
              style={{ flex: 1 }}
              bounces={true}
              scrollIndicatorInsets={{ right: 1 }}
              nestedScrollEnabled={true}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.delay(index * 40)
                    .duration(500)
                    .springify()}
                  layout={LinearTransition.springify()}
                >
                  <InteractionComponent
                    interactionId={item.id.toString()}
                    createdAt={item.created_at}
                    rawContent={item.raw_content}
                  />
                </Animated.View>
              )}
              ListFooterComponent={() => (
                <Animated.View
                  entering={FadeInUp.delay(300).duration(500).springify()}
                  style={{
                    marginTop: 20,
                    marginBottom: 40,
                    alignItems: "center",
                  }}
                >
                  <Pressable
                    onPress={toggleExpanded}
                    style={{
                      backgroundColor: "#000",
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderRadius: 20,
                      alignItems: "center",

                      width: "30%",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      colapse
                    </Text>
                  </Pressable>
                </Animated.View>
              )}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}
