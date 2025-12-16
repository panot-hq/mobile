import "@/lib/i18n";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { ContactsProvider } from "@/contexts/ContactsContext";
import { InteractionProvider } from "@/contexts/InteractionContext";
import { InteractionOverlayProvider } from "@/contexts/InteractionOverlayContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { TalkAboutThemProvider } from "@/contexts/TalkAboutThemContext";
export { ErrorBoundary } from "expo-router";

import StripeProvider from "@/components/stripe/stripe-provider";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <StripeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <AuthProvider>
            <SettingsProvider>
              <ContactsProvider>
                <InteractionProvider>
                  <RecordingProvider>
                    <TalkAboutThemProvider>
                      <InteractionOverlayProvider>
                        <RootLayoutNav />
                      </InteractionOverlayProvider>
                    </TalkAboutThemProvider>
                  </RecordingProvider>
                </InteractionProvider>
              </ContactsProvider>
            </SettingsProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          animation: "fade",
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="(interactions)/assign"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(contacts)/new"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="(contacts)/import"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="(contacts)/[id]"
        options={{
          presentation: "card",
          animation: "slide_from_right",
          gestureEnabled: false,
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          animation: "fade",
          headerShown: false,
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: "black",
          },
        }}
      />
    </Stack>
  );
}
