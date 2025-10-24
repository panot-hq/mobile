import PanotBanner from "@/assets/images/panot-banner.svg";
import { IOSAuth } from "@/components/auth/AuthNativeIOSButton";
import AuthButton, { EmailButton } from "@/components/ui/Button";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, Text, TouchableWithoutFeedback, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function SignupScreen() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [showNewContent, setShowNewContent] = useState(false);

  const bannerTranslateY = useSharedValue(0);
  const mainButtonsTranslateY = useSharedValue(0);
  const newContentTranslateY = useSharedValue(200);
  const newContentOpacity = useSharedValue(0);
  const shadowAnimated = useSharedValue(0);

  const performAnimation = (toNewContent: boolean, onComplete?: () => void) => {
    const springConfig = {
      damping: 20,
      stiffness: 120,
      mass: 1,
    };

    const targetBannerY = toNewContent ? -154 : 0;
    const targetMainButtonsY = toNewContent ? 200 : 0;
    const targetNewContentY = toNewContent ? -120 : 300;
    const targetNewContentOpacity = toNewContent ? 1 : 0;
    const targetShadow = toNewContent ? 1 : 0;

    if (toNewContent) {
      setIsAnimated(true);
      setShowNewContent(true);
    }

    bannerTranslateY.value = withSpring(targetBannerY, springConfig);
    mainButtonsTranslateY.value = withSpring(targetMainButtonsY, springConfig);
    newContentTranslateY.value = withSpring(targetNewContentY, springConfig);
    shadowAnimated.value = withSpring(targetShadow, springConfig);
    newContentOpacity.value = withSpring(
      targetNewContentOpacity,
      springConfig,
      (finished) => {
        "worklet";
        if (finished && !toNewContent) {
          runOnJS(setIsAnimated)(false);
          runOnJS(setShowNewContent)(false);
        }
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );
  };

  const animateToNewContent = () => {
    performAnimation(true);
  };

  const animateToOriginalState = () => {
    if (!isAnimated) return;
    performAnimation(false);
  };

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bannerTranslateY.value }],
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOffset: {
      width: 0,
      height: interpolate(shadowAnimated.value, [0, 1], [10, 15]),
    },
    shadowOpacity: interpolate(shadowAnimated.value, [0, 1], [0.25, 0.5]),
    shadowRadius: interpolate(shadowAnimated.value, [0, 1], [3.84, 15]),
    elevation: 10,
  }));

  const mainButtonsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mainButtonsTranslateY.value }],
  }));

  const newContentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: newContentTranslateY.value }],
    opacity: newContentOpacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TouchableWithoutFeedback
        onPress={() => {
          animateToOriginalState();
        }}
      >
        <Animated.View
          style={[
            {
              width: 334,
              height: 570,
              position: "absolute",
              top: 78,
              left: (width - 334) / 2,
            },
            bannerAnimatedStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                shadowColor: "#000",
              },
              shadowAnimatedStyle,
            ]}
          >
            <PanotBanner
              style={{
                width: 334,
                height: 570,
              }}
            />
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 47,
            width: "100%",
            flexDirection: "row",
            gap: 16,
            justifyContent: "center",
          },
          mainButtonsAnimatedStyle,
        ]}
      >
        <AuthButton
          title="I'm new here"
          onPress={() => {
            animateToNewContent();
          }}
          variant="primary"
          width={203}
          height={82}
        />

        <AuthButton
          title="Restore"
          onPress={() => console.log("Restore pressed")}
          variant="secondary"
          width={117}
          height={82}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -80,
            width: "100%",
            alignItems: "center",
          },
          newContentAnimatedStyle,
        ]}
      >
        <Entypo
          name="chevron-down"
          size={24}
          color="black"
          style={{ marginBottom: 25 }}
        />
        <View style={{ marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "#000",
              marginTop: 10,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Let's get you set up.
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#696969",
              fontWeight: "300",
              marginBottom: 40,
              textAlign: "center",
              paddingHorizontal: 40,
              lineHeight: 22,
            }}
          >
            An account keeps your contacts safe and sound, ready whenever you
            need them.
          </Text>
        </View>
        <View style={{ gap: 12, marginBottom: 20 }}>
          <IOSAuth />
          <EmailButton
            title="Continue with Email"
            onPress={() => {
              router.push("./(continue)/email");
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}
