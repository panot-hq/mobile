import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { supabase } from "@/lib/supabase";
import {
  confirmPlatformPayPayment,
  PlatformPay,
  PlatformPayButton,
  useStripe,
} from "@stripe/stripe-react-native";
import { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

async function fetchPaymentSheetParams(
  amount: number,
  user: User | null
): Promise<{
  clientSecret: string;
  ephemeralKey: string;
  customer: string;
}> {
  const { data, error } = await supabase.functions.invoke("stripe-endpoint", {
    body: {
      amount,
      user_email: user?.email,
      user_name: user?.user_metadata.full_name || "angel",
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

const items = [];

export default function CheckoutForm({ amount }: { amount: number }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { subscribe, syncSubscriptionState, isSubscribed } = useSubscription();

  const handleOpenTermsOfUse = async () => {
    const termsUrl = "https://panotapp.com/en/terms"; 
    if (termsUrl) {
      await WebBrowser.openBrowserAsync(termsUrl);
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    const privacyUrl = "https://panotapp.com/en/privacy"; 
    if (privacyUrl) {
      await WebBrowser.openBrowserAsync(privacyUrl);
    }
  };
  const pay = async () => {
    setLoading(true);
    const { clientSecret, ephemeralKey, customer } =
      await fetchPaymentSheetParams(amount, user);

    const { error } = await confirmPlatformPayPayment(clientSecret, {
      applePay: {
        merchantCountryCode: "ES",
        currencyCode: "EUR",
        cartItems: [
          {
            label: "Panot Subscription",
            amount: "4.99",
            paymentType: PlatformPay.PaymentType.Recurring,
            intervalUnit: PlatformPay.IntervalUnit.Month,
            intervalCount: 1,
          },
        ],
        request: {
          type: PlatformPay.PaymentRequestType.Recurring,
          description: "Panot Subscription",
          managementUrl: "https://panot.com",
          billing: {
            paymentType: PlatformPay.PaymentType.Recurring,
            intervalUnit: PlatformPay.IntervalUnit.Month,
            intervalCount: 1,
            label: "Panot Subscription",
            amount: "4.99",
          },
        },
      },
    });
    if (error) {
      setLoading(false);
    } else {
      await subscribe();
      router.replace("/(auth)/(paywall)/congrats");
      if (!isSubscribed) {
        syncSubscriptionState(true);
      }
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        position: "absolute",
        bottom: 40,
        flex: 1,
        flexDirection: "column",
        gap: 2,
      }}
    >
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text style={{ fontSize: 12, fontWeight: "300", color: "#000" }}>start for only 4.99€/month</Text>
      </View>
      
      <PlatformPayButton
        onPress={pay}
        type={PlatformPay.ButtonType.Continue}
        appearance={PlatformPay.ButtonStyle.Black}
        borderRadius={20}
        disabled={loading}
        style={{ width: 350, height: 50 }}
      />
      <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 15, marginBottom: 12 }}>
        <Text style={{ fontSize: 10, fontWeight: "300", color: "#000", textAlign: "center" }}>Subscription auto-renews unless canceled at least 24-hours before the end of the current period.</Text>
      </View>

      <View style={{ width: "100%", alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "center" }}>
        <Pressable onPress={handleOpenTermsOfUse}>
          <Text style={{ fontSize: 11, fontWeight: "300", color: "#000", textDecorationLine: "underline" }}>Terms of Use</Text>
        </Pressable>
        <Text style={{ fontSize: 10, fontWeight: "300", color: "#000" }}>-</Text>
        <Pressable onPress={handleOpenPrivacyPolicy}>
          <Text style={{ fontSize: 11, fontWeight: "300", color: "#000", textDecorationLine: "underline" }}>Privacy Policy</Text>
        </Pressable>
      </View>
    </View>
  );
}
