import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function IndexRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user?.id) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }
}
