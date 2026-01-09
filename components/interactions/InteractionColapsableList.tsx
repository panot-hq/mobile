import Badge from "@/components/ui/Badge";
import { useInteractions } from "@/lib/hooks/useLegendState";
import { formatCreatedAt } from "@/lib/utils/date-formatter";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import InteractionComponent from "./InteractionComponent";

const { height: screenHeight } = Dimensions.get("window");

interface InteractionListProps {
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
}

export default function InteractionList({
  isExpanded,
  onExpandedChange,
}: InteractionListProps) {
  const { t, i18n } = useTranslation();
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
      onExpandedChange(false);
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
    onExpandedChange(!isExpanded);
  };

  const stackedAnimatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: interpolate(
        expandedValue.value,
        [0, 1],
        [200, 20000],
        Extrapolate.CLAMP
      ),
    };
  });

  const renderStackedInteractions = () => {
    const maxVisible = 4;
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
                    {formatCreatedAt(interaction.created_at).split(" ")[0]}
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    {new Date(
                      interaction.created_at || new Date()
                    ).toLocaleTimeString(i18n.language, {
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
                      marginTop: 12,
                      marginBottom: -7,
                    }}
                  >
                    {t("interactions.more_interactions", {
                      count: interactions.length - 1,
                    })}
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
      style={{ flex: 1, padding: 10, marginTop: 30, gap: 25, width: "93%" }}
    >
      <Badge
        title={t("interactions.capture_dock")}
        color="#eee"
        textColor="#000"
      />

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
            {t("interactions.no_registered_interactions")}
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
            <View
              style={{
                gap: 10,
                paddingTop: 10,
                paddingBottom: 120,
                paddingHorizontal: 8,
              }}
            >
              {interactions.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(index * 40)
                    .duration(500)
                    .springify()}
                  layout={LinearTransition.springify()}
                >
                  <InteractionComponent
                    interactionId={item.id.toString()}
                    createdAt={item.created_at}
                    rawContent={item.raw_content}
                    status={item.status || "unprocessed"}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}
