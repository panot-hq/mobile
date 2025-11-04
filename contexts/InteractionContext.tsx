import React, { createContext, ReactNode, useContext, useState } from "react";

interface InteractionContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(
  undefined
);

interface InteractionProviderProps {
  children: ReactNode;
}

export function InteractionProvider({ children }: InteractionProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <InteractionContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error(
      "useInteraction must be used within an InteractionProvider"
    );
  }
  return context;
}
