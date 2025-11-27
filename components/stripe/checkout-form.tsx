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
import { useState } from "react";
import { View } from "react-native";

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

export default function CheckoutForm({ amount }: { amount: number }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { subscribe, syncSubscriptionState, isSubscribed } = useSubscription();
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
            amount: "2.99",
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
            amount: "2.99",
          },
        },
      },
    });
    if (error) {
      setLoading(false);
    } else {
      await subscribe();
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
        bottom: 50,
      }}
    >
      <PlatformPayButton
        onPress={pay}
        type={PlatformPay.ButtonType.Pay}
        appearance={PlatformPay.ButtonStyle.Black}
        borderRadius={16}
        disabled={loading}
        style={{ width: 350, height: 50 }}
      />
    </View>
  );
}
