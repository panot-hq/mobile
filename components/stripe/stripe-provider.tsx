import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import * as Linking from "expo-linking";

const stripeConfig = Constants.expoConfig?.plugins?.find(
  (p) => p[0] === "@stripe/stripe-react-native"
)?.[1];

const merchantId = stripeConfig?.merchantIdentifier;
const publishableKey = stripeConfig?.publishableKey;

if (!merchantId || !publishableKey) {
  throw new Error('Missing Expo config for "@stripe/stripe-react-native"');
}

export default function ExpoStripeProvider(
  props: Omit<
    React.ComponentProps<typeof StripeProvider>,
    "publishableKey" | "merchantIdentifier"
  >
) {
  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantId}
      urlScheme={Linking.createURL("/")?.split(":")[0]}
      {...props}
    />
  );
}
