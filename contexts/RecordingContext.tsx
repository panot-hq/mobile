import React, { createContext, ReactNode, useContext, useState } from "react";

interface RecordingContextType {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  shouldBlur: boolean;
  setShouldBlur: (blur: boolean) => void;
  isListExpanded: boolean;
  setIsListExpanded: (expanded: boolean) => void;
  assignedContactId: string | null;
  setAssignedContactId: (contactId: string | null) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

interface RecordingProviderProps {
  children: ReactNode;
}

export function RecordingProvider({ children }: RecordingProviderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [shouldBlur, setShouldBlur] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [assignedContactId, setAssignedContactId] = useState<string | null>(
    null
  );

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        setIsRecording,
        shouldBlur,
        setShouldBlur,
        isListExpanded,
        setIsListExpanded,
        assignedContactId,
        setAssignedContactId,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}
