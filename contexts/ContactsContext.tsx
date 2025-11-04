import React, { createContext, ReactNode, useContext, useState } from "react";

interface ContactsContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined
);

interface ContactsProviderProps {
  children: ReactNode;
}

export function ContactsProvider({ children }: ContactsProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ContactsContext.Provider
      value={{ refreshTrigger, triggerRefresh, searchTerm, setSearchTerm }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
}
