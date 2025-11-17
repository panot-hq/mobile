import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface SettingsContextType {
  transcriptionLanguage: string;
  setTranscriptionLanguage: (language: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const TRANSCRIPTION_LANGUAGE_KEY = "@panot:transcription_language";
const DEFAULT_LANGUAGE = "es-ES";

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [transcriptionLanguage, setTranscriptionLanguageState] =
    useState<string>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language preference from storage on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(
          TRANSCRIPTION_LANGUAGE_KEY
        );
        if (savedLanguage) {
          setTranscriptionLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error("Error loading transcription language:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  const setTranscriptionLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem(TRANSCRIPTION_LANGUAGE_KEY, language);
      setTranscriptionLanguageState(language);
    } catch (error) {
      console.error("Error saving transcription language:", error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        transcriptionLanguage,
        setTranscriptionLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
