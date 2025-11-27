import { useAuth } from "@/contexts/AuthContext";
import { ProfilesService } from "@/lib/database/index";
import { useState } from "react";
import { useProfile } from "./useLegendState";

export function useSubscription() {
  const { user } = useAuth();
  const {
    profile,
    updateSubscription: updateSubscriptionLocal,
    isSubscribed,
  } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } =
        await ProfilesService.updateSubscription(user.id, true);

      if (supabaseError) {
        setError(supabaseError.message);
        return { success: false, error: supabaseError.message };
      }

      updateSubscriptionLocal(true);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } =
        await ProfilesService.updateSubscription(user.id, false);

      if (supabaseError) {
        setError(supabaseError.message);
        return { success: false, error: supabaseError.message };
      }

      updateSubscriptionLocal(false);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionFromDB = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const isSubscribedDB = await ProfilesService.isSubscribed(user.id);

      if (isSubscribedDB !== isSubscribed) {
        updateSubscriptionLocal(isSubscribedDB);
      }

      return isSubscribedDB;
    } catch (err) {
      console.error("Error checking subscription from DB:", err);
      return false;
    }
  };

  const syncSubscriptionState = (subscribed: boolean) => {
    updateSubscriptionLocal(subscribed);
  };

  return {
    isSubscribed,
    isLoading,
    error,
    profile,
    subscribe,
    unsubscribe,
    checkSubscriptionFromDB,
    syncSubscriptionState,
  };
}
