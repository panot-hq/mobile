import { supabase } from "@/lib/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
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

          if (!credential.identityToken) {
            throw new Error("No identityToken received from Apple.");
          }

          const {
            error: signInError,
            data: { user, session },
          } = await supabase.auth.signInWithIdToken({
            provider: "apple",
            token: credential.identityToken,
          });

          if (signInError) {
            throw signInError;
          }

          if (
            credential.fullName &&
            (credential.fullName.givenName || credential.fullName.familyName)
          ) {
            const nameParts = [];
            if (credential.fullName.givenName)
              nameParts.push(credential.fullName.givenName);
            if (credential.fullName.middleName)
              nameParts.push(credential.fullName.middleName);
            if (credential.fullName.familyName)
              nameParts.push(credential.fullName.familyName);
            const fullName = nameParts.join(" ");

            if (fullName.trim()) {
              const { error: updateError } = await supabase.auth.updateUser({
                data: {
                  display_name: fullName,
                  full_name: fullName,
                  given_name: credential.fullName.givenName,
                  family_name: credential.fullName.familyName,
                },
              });
            }
          }
        } catch (e: any) {
          throw e;
        }
      }}
    />
  );
}
