import KeyboardArrowButton from "@/components/auth/KeyboardArrowButton";
import { ArrowButton } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSignup } from "@/contexts/SignupContext";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

export default function PasswordScreen() {
  const { signUpWithOTP } = useAuth();
  const { signupData, setPassword, clearSignupData, isPasswordValid } =
    useSignup();
  const [password, setPasswordState] = useState(signupData.password);
  const [isLoading, setIsLoading] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const showKeyboard = () => {
    textInputRef.current?.focus();
  };

  useEffect(() => {
    showKeyboard();
  }, []);

  const handleSignUp = async () => {
    if (!isPasswordValid()) return;

    setIsLoading(true);
    try {
      const result = await signUpWithOTP(
        signupData.email,
        password,
        signupData.name
      );

      if (result.success) {
        router.push("./email-verify");
      } else {
        Alert.alert(
          "Sign Up Failed",
          result.error || "An error occurred during sign up"
        );
      }
    } catch (error) {
      Alert.alert("Sign Up Failed", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          position: "absolute",
          top: 68,
          left: 15,
          zIndex: 1,
        }}
      >
        <ArrowButton
          onPress={() => router.back()}
          iconDimensions={28}
          iconColor="white"
          backgroundColor="black"
          borderRadius={13}
        />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 170 }}>
        <Text style={{ color: "white", fontSize: 35, fontWeight: "500" }}>
          Create a password
        </Text>
        <TextInput
          ref={textInputRef}
          style={{
            color: "white",
            fontSize: 21,
            fontWeight: "500",
            marginTop: 27,
          }}
          value={password}
          onChangeText={(text) => {
            setPasswordState(text);
            setPassword(text);
          }}
          enterKeyHint="done"
          placeholder="******************"
          placeholderTextColor="#868686"
          autoCapitalize="none"
          keyboardType="ascii-capable"
          returnKeyType="done"
          autoComplete="password"
          contextMenuHidden={true}
          autoCorrect={false}
          spellCheck={false}
          secureTextEntry={true}
          onSubmitEditing={handleSignUp}
        />
        {password.length > 0 && !isPasswordValid() && (
          <Text style={{ color: "#ff6b6b", fontSize: 14, marginTop: 8 }}>
            Password must be at least 6 characters long
          </Text>
        )}
      </View>

      <KeyboardArrowButton
        onPress={handleSignUp}
        isEnabled={isPasswordValid()}
        isLoading={isLoading}
      />
    </View>
  );
}
