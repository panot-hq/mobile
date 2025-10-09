import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { ContactsProvider } from "@/contexts/ContactsContext";
import { InteractionProvider } from "@/contexts/InteractionContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: undefined,
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
    <AuthProvider>
      <ContactsProvider>
        <InteractionProvider>
          <RecordingProvider>
            <RootLayoutNav />
          </RecordingProvider>
        </InteractionProvider>
      </ContactsProvider>
    </AuthProvider>
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
        name="(interactions)/[id]"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
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
        name="(contacts)/[id]"
        options={{
          presentation: "card",
          animation: "slide_from_right",
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
