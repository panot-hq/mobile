import React, { createContext, ReactNode, useContext, useState } from "react";

interface TalkAboutThemContextType {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  shouldBlur: boolean;
  setShouldBlur: (blur: boolean) => void;
  isOverlayVisible: boolean;
  setIsOverlayVisible: (visible: boolean) => void;
}

const TalkAboutThemContext = createContext<
  TalkAboutThemContextType | undefined
>(undefined);

interface TalkAboutThemProviderProps {
  children: ReactNode;
}

export function TalkAboutThemProvider({
  children,
}: TalkAboutThemProviderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [shouldBlur, setShouldBlur] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  return (
    <TalkAboutThemContext.Provider
      value={{
        isRecording,
        setIsRecording,
        shouldBlur,
        setShouldBlur,
        isOverlayVisible,
        setIsOverlayVisible,
      }}
    >
      {children}
    </TalkAboutThemContext.Provider>
  );
}

export function useTalkAboutThem() {
  const context = useContext(TalkAboutThemContext);
  if (context === undefined) {
    throw new Error(
      "useTalkAboutThem must be used within a TalkAboutThemProvider"
    );
  }
  return context;
}
