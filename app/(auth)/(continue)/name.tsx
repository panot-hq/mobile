import { ArrowButton } from "@/components/auth/Button";
import KeyboardArrowButton from "@/components/auth/KeyboardArrowButton";
import { useSignup } from "@/contexts/SignupContext";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function NameScreen() {
  const { signupData, setName, isNameValid } = useSignup();
  const [name, setNameState] = useState(signupData.name);
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
          What should panot call you?
        </Text>
        <TextInput
          ref={textInputRef}
          style={{
            color: "white",
            fontSize: 21,
            fontWeight: "500",
            marginTop: 27,
          }}
          value={name}
          onChangeText={(text) => {
            setNameState(text);
            setName(text);
          }}
          enterKeyHint="next"
          placeholder="your name"
          placeholderTextColor="#868686"
          autoCapitalize="words"
          keyboardType="default"
          returnKeyType="next"
          autoComplete="name"
          autoCorrect={false}
          spellCheck={false}
        />
      </View>

      <KeyboardArrowButton
        onPress={() => router.push("./password")}
        isEnabled={isNameValid()}
      />
    </View>
  );
}
