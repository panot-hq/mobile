import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Redirect } from "expo-router";

export default function IndexRedirect() {
  const { user, loading } = useAuth();
  const { isSubscribed, profile } = useSubscription();

  if (loading) {
    return null;
  }

  if (user?.id) {
    if (isSubscribed) {
      return <Redirect href="/(tabs)/present" />;
    } else {
      return <Redirect href="/(auth)/(paywall)/paywall" />;
    }
  } else {
    return <Redirect href="/(auth)" />;
  }
}
