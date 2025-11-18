import KeyboardArrowButton from "@/components/auth/KeyboardArrowButton";
import { ArrowButton } from "@/components/ui/Button";
import { useSignup } from "@/contexts/SignupContext";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function EmailScreen() {
  const { signupData, setEmail, isEmailValid } = useSignup();
  const [email, setEmailState] = useState(signupData.email);
  const textInputRef = useRef<TextInput>(null);

  const showKeyboard = () => {
    textInputRef.current?.focus();
  };

  useEffect(() => {
    showKeyboard();
  }, []);

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
          Enter your email
        </Text>
        <TextInput
          ref={textInputRef}
          style={{
            color: "white",
            fontSize: 21,
            fontWeight: "500",
            marginTop: 27,
          }}
          value={email}
          onChangeText={(text) => {
            setEmailState(text);
            setEmail(text);
          }}
          enterKeyHint="next"
          placeholder="example.panot@mail.com"
          placeholderTextColor="#868686"
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          autoComplete="email"
          autoCorrect={false}
          spellCheck={false}
        />
      </View>

      <KeyboardArrowButton
        onPress={() => router.push("./name")}
        isEnabled={isEmailValid()}
      />
    </View>
  );
}
