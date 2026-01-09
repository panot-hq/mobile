import { IOSAuth } from "@/components/auth/AuthNativeIOSButton";
import CloseButton from "@/components/auth/buttons/CloseButton";
import BaseButton from "@/components/ui/BaseButton";
import { useAuth } from "@/contexts/AuthContext";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RestoreScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = () => {
    return password.length >= 6;
  };

  const canSubmit = () => {
    return isEmailValid() && isPasswordValid() && !isLoading;
  };

  const handleSignIn = async () => {
    if (!canSubmit()) return;

    setIsLoading(true);
    try {
      const result = await signIn(email, password);

      if (!result.success) {
        Alert.alert(
          "Sign In Failed",
          result.error || "An error occurred during sign in"
        );
      }
      // If successful, the auth state change listener will handle navigation
    } catch (error) {
      Alert.alert("Sign In Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
      <Pressable onPress={() => Keyboard.dismiss()}>
        <View
          style={{
            position: "absolute",
            top: 68,
            right: 15,
            zIndex: 1,
          }}
        >
          <CloseButton
            onPress={() => router.back()}
            iconDimensions={23}
            iconColor="black"
            backgroundColor="white"
            borderRadius={13}
          />
        </View>

        <View
          style={{
            flex: 1,
            width: "100%",
            paddingHorizontal: 24,
            paddingTop: 170,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 35,
              fontWeight: "500",
              color: "#000",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Welcome back
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
            Sign in to restore your account and access your contacts.
          </Text>

          <View style={{ width: "100%", maxWidth: 334, gap: 10 }}>
            <View>
              <TextInput
                ref={emailInputRef}
                style={{
                  backgroundColor: "#E9E9E9",
                  borderRadius: 13,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 17,
                  color: "#000",
                  fontWeight: "400",
                }}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#868686"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                autoComplete="email"
                autoCorrect={false}
                spellCheck={false}
                autoFocus={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  setEmailFocused(false);
                  setEmailTouched(true);
                }}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              {emailTouched &&
                !emailFocused &&
                email.length > 0 &&
                !isEmailValid() && (
                  <Text
                    style={{
                      color: "#ff6b6b",
                      fontSize: 14,
                      marginTop: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    Please enter a valid email address
                  </Text>
                )}
            </View>

            <View>
              <TextInput
                ref={passwordInputRef}
                style={{
                  backgroundColor: "#E9E9E9",
                  borderRadius: 13,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 17,
                  color: "#000",
                  fontWeight: "400",
                }}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#868686"
                autoCapitalize="none"
                keyboardType="ascii-capable"
                returnKeyType="done"
                autoComplete="password"
                autoCorrect={false}
                spellCheck={false}
                secureTextEntry={true}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => {
                  setPasswordFocused(false);
                  setPasswordTouched(true);
                }}
                onSubmitEditing={handleSignIn}
              />
              {passwordTouched &&
                !passwordFocused &&
                password.length > 0 &&
                !isPasswordValid() && (
                  <Text
                    style={{
                      color: "#ff6b6b",
                      fontSize: 14,
                      marginTop: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    Password must be at least 6 characters long
                  </Text>
                )}
            </View>
            <View style={{ marginTop: 15 }}>
              <BaseButton
                onPress={canSubmit() ? handleSignIn : () => {}}
                width={334}
                height={45}
                borderRadius={13}
                backgroundColor={canSubmit() ? "#000" : "#999"}
                disabled={!canSubmit()}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    style={{
                      color: canSubmit() ? "white" : "white",
                      fontSize: 17,
                      fontWeight: "500",
                    }}
                  >
                    Sign In
                  </Text>
                )}
              </BaseButton>
            </View>

            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#696969",
                  fontSize: 16,
                  fontWeight: "300",
                }}
              >
                or
              </Text>
            </View>

            <View style={{ gap: 12, marginTop: 20 }}>
              <IOSAuth
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
              />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
