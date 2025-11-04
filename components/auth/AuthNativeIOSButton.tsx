import { ProfilesService } from "@/lib/database/index";
import { supabase } from "@/lib/supabase";
import { clearPersistedData, initializeSync } from "@/lib/supaLegend";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { Platform } from "react-native";

type Props = {
  buttonType?: AppleAuthentication.AppleAuthenticationButtonType;
};

export function IOSAuth({
  buttonType = AppleAuthentication.AppleAuthenticationButtonType.CONTINUE,
}: Props) {
  if (Platform.OS !== "ios") return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={buttonType}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={13}
      style={{ width: 334, height: 45 }}
      onPress={async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          if (!credential.identityToken) throw new Error("No identityToken");

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "apple",
            token: credential.identityToken,
          });

          if (error) {
            console.log("Supabase signIn error:", error);
            return;
          }

          if (credential.fullName || credential.email) {
            const fullName = credential.fullName
              ? AppleAuthentication.formatFullName(credential.fullName)
              : undefined;

            await supabase.auth.updateUser({
              data: { full_name: fullName },
              email: credential.email ?? undefined,
            });
          }

          await supabase.auth.setSession(data.session);

          await new Promise((resolve) => setTimeout(resolve, 500));

          const userId = data.session.user.id;

          await clearPersistedData();

          await ProfilesService.getOrCreate(userId);
          await initializeSync(userId);

          router.replace("/(tabs)/present");
        } catch (e: any) {
          if (e?.code === "ERR_REQUEST_CANCELED") return;
          console.log("Apple sign-in error:", e);
        }
      }}
    />
  );
}
