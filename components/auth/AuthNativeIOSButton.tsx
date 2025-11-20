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
          // Sign in via Supabase Auth.
          if (credential.identityToken) {
            const {
              error,
              data: { user },
            } = await supabase.auth.signInWithIdToken({
              provider: "apple",
              token: credential.identityToken,
            });
            console.log(JSON.stringify({ error, user }, null, 2));
            if (!error) {
              // Apple only provides the user's full name on the first sign-in
              // Save it to user metadata if available
              if (credential.fullName) {
                const nameParts = [];
                if (credential.fullName.givenName)
                  nameParts.push(credential.fullName.givenName);
                if (credential.fullName.middleName)
                  nameParts.push(credential.fullName.middleName);
                if (credential.fullName.familyName)
                  nameParts.push(credential.fullName.familyName);
                const fullName = nameParts.join(" ");
                await supabase.auth.updateUser({
                  data: {
                    full_name: fullName,
                    given_name: credential.fullName.givenName,
                    family_name: credential.fullName.familyName,
                  },
                });
              }
              // User is signed in.
            }
          } else {
            throw new Error("No identityToken.");
          }
        } catch (e: any) {
          if (e?.code === "ERR_REQUEST_CANCELED") return;
        }
      }}
    />
  );
}
