import { useAuth } from "@/contexts/AuthContext";
import { SignupProvider } from "@/contexts/SignupContext";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
export default function AuthLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      router.replace("/(tabs)/present");
    }
  }, [user?.id]);

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
          name="(continue-signup)/email"
          options={{
            animation: "slide_from_bottom",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(continue-signup)/password"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(continue-signup)/name"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(continue-signup)/email-verify"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="restore"
          options={{
            animation: "fade",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </SignupProvider>
  );
}
