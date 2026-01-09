import PaywallBanner from "@/assets/images/paywall-banner.svg";
import CloseButton from "@/components/auth/buttons/CloseButton";
import CheckoutForm from "@/components/stripe/checkout-form";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function PaywallScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ position: "absolute", top: 60, right: 20 }}>
        <CloseButton
          onPress={() => router.back()}
          backgroundColor={"transparent"}
          iconColor={"black"}
          iconDimensions={25}
        />
      </View>
      <PaywallBanner style={{ position: "absolute", top: 125 }} />
      <CheckoutForm amount={299} />
    </View>
  );
}
