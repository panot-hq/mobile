import LoadingScreen from "@/components/ui/LoadingScreen";
import { ProfilesService } from "@/lib/database/index";
import { supabase } from "@/lib/supabase";
import { clearPersistedData, initializeSync } from "@/lib/supaLegend";
import { Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const DEV_MODE = false;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSyncing: boolean;
  signOut: () => Promise<void>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithOTP: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (
    email: string,
    token: string
  ) => Promise<{ success: boolean; error?: string }>;
  resendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isSyncing: false,
  signOut: async () => {},
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signUpWithOTP: async () => ({ success: false }),
  verifyOTP: async () => ({ success: false }),
  resendOTP: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const initializedRef = useRef(false);
  const authStateListenerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting initial session:", error);
        }

        if (session?.user) {
          setIsSyncing(true);
          await ProfilesService.getOrCreate(session.user.id);
          await initializeSync(session.user.id);
          setIsSyncing(false);
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialCheckComplete(true);
        initializedRef.current = true;

        SplashScreen.hideAsync();

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          if (event === "INITIAL_SESSION") {
            return;
          }

          if (initializedRef.current) {
            if (session?.user) {
              if (event === "SIGNED_IN") {
                setIsSyncing(true);
                await clearPersistedData();
                await ProfilesService.getOrCreate(session.user.id);
                await initializeSync(session.user.id);
                setIsSyncing(false);

                router.replace("/(tabs)/present");
              }
            } else {
              await clearPersistedData();
            }

            setSession(session);
            setUser(session?.user ?? null);
          }
        });

        authStateListenerRef.current = subscription;
      } catch (error) {
        if (!mounted) return;
        console.error("Error initializing auth:", error);
        setLoading(false);
        setInitialCheckComplete(true);
        initializedRef.current = true;

        SplashScreen.hideAsync();
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authStateListenerRef.current) {
        authStateListenerRef.current.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    await clearPersistedData();
    await supabase.auth.signOut();
    router.replace("/(auth)");
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  const signUpWithOTP = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        return { success: true };
      }

      return { success: false, error: "Verification failed" };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  if (!initialCheckComplete) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSyncing,
        signOut,
        signIn,
        signUp,
        signUpWithOTP,
        verifyOTP,
        resendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
