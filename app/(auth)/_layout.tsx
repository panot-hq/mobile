import { SignupProvider } from "@/contexts/SignupContext";
import { Stack } from "expo-router";
export default function AuthLayout() {
  return (
    <SignupProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(continue)/email"
          options={{
            animation: "slide_from_bottom",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(continue)/password"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(continue)/name"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(continue)/email-verify"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </SignupProvider>
  );
}
