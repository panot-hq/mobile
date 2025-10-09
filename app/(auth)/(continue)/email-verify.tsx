import KeyboardArrowButton from "@/components/auth/KeyboardArrowButton";
import { ArrowButton } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSignup } from "@/contexts/SignupContext";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmailVerifyScreen() {
  const { verifyOTP, resendOTP } = useAuth();
  const { signupData, clearSignupData } = useSignup();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const textInputRef = useRef<TextInput>(null);

  const showKeyboard = () => {
    textInputRef.current?.focus();
  };

  useEffect(() => {
    showKeyboard();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      const result = await verifyOTP(signupData.email, otp);

      if (result.success) {
        clearSignupData();
        router.replace("/(tabs)/present");
      } else {
        Alert.alert(
          "Verification Failed",
          result.error || "Invalid verification code. Please try again."
        );
        setOtp("");
      }
    } catch (error) {
      Alert.alert("Verification Failed", "An unexpected error occurred");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const formatOTP = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    return cleaned.slice(0, 6);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const result = await resendOTP(signupData.email);

      if (result.success) {
        setResendCooldown(60); // 60 second cooldown
        Alert.alert(
          "Code Sent",
          "A new verification code has been sent to your email."
        );
      } else {
        Alert.alert(
          "Resend Failed",
          result.error ||
            "Failed to resend verification code. Please try again."
        );
      }
    } catch (error) {
      Alert.alert("Resend Failed", "An unexpected error occurred");
    } finally {
      setIsResending(false);
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
          Check your email
        </Text>
        <Text
          style={{
            color: "#868686",
            fontSize: 16,
            fontWeight: "400",
            marginTop: 12,
            lineHeight: 22,
          }}
        >
          We sent a 6-digit code to{"\n"}
          <Text style={{ color: "white" }}>{signupData.email}</Text>
        </Text>

        <View style={styles.otpContainer}>
          <TouchableOpacity
            style={styles.otpBoxContainer}
            activeOpacity={1}
            onPress={showKeyboard}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const hasDigit = otp[index];
              const isActive = index === otp.length;

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    hasDigit && styles.otpBoxFilled,
                    isActive && styles.otpBoxActive,
                  ]}
                >
                  <Text style={styles.otpDigit}>{otp[index] || ""}</Text>
                </View>
              );
            })}
          </TouchableOpacity>
          <TextInput
            ref={textInputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={(text) => {
              const cleaned = formatOTP(text);
              setOtp(cleaned);
            }}
            keyboardType="numeric"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoCorrect={false}
            spellCheck={false}
            maxLength={6}
            onSubmitEditing={handleVerifyOTP}
          />
        </View>

        {otp.length > 0 && otp.length < 6 && (
          <Text style={{ color: "#ff6b6b", fontSize: 14, marginTop: 8 }}>
            Please enter all 6 digits
          </Text>
        )}

        <View style={styles.resendContainer}>
          <Text style={{ color: "#868686", fontSize: 16 }}>
            Didn't receive a code?{" "}
          </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendCooldown > 0 || isResending}
            style={styles.resendButton}
          >
            <Text
              style={[
                styles.resendText,
                {
                  color: resendCooldown > 0 || isResending ? "#666" : "white",
                  opacity: resendCooldown > 0 || isResending ? 0.5 : 1,
                },
              ]}
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend (${resendCooldown}s)`
                : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardArrowButton
        onPress={handleVerifyOTP}
        isEnabled={otp.length === 6}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  otpContainer: {
    marginTop: 40,
    alignItems: "center",
    position: "relative",
  },
  otpBoxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  otpBoxFilled: {
    borderColor: "#666",
    backgroundColor: "#1a1a1a",
  },
  otpBoxActive: {
    borderColor: "white",
    backgroundColor: "#1a1a1a",
  },
  otpDigit: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    color: "transparent",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  resendText: {
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
