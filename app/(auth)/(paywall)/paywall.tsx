import CheckoutForm from "@/components/stripe/checkout-form";
import { useAuth } from "@/contexts/AuthContext";
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
      <CheckoutForm amount={299} />
    </View>
  );
}
