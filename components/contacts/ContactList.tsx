import { Contact } from "@/lib/database/database.types";
import { useContacts as useLegendContacts } from "@/lib/hooks/useLegendState";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import ContactListElement from "./ContactListElement";

interface ContactGroup {
  letter: string;
  contacts: Contact[];
}

interface ContactListItem {
  type: "header" | "contact";
  letter?: string;
  contact?: Contact;
}

interface ContactListProps {
  searchTerm?: string;
}

export default function ContactList({ searchTerm = "" }: ContactListProps) {
  // Usar el hook de Legend State (local-first)
  const { contacts } = useLegendContacts();

  // Ordenar contactos alfabéticamente por first_name
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const nameA = (
        a.first_name ||
        a.last_name ||
        a.company ||
        ""
      ).toLowerCase();
      const nameB = (
        b.first_name ||
        b.last_name ||
        b.company ||
        ""
      ).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [contacts]);

  const filterContacts = (
    contacts: Contact[],
    searchTerm: string
  ): Contact[] => {
    if (!searchTerm.trim()) {
      return contacts;
    }

    const lowercaseSearch = searchTerm.toLowerCase().trim();

    return contacts.filter((contact) => {
      const firstName = (contact.first_name || "").toLowerCase();
      const lastName = (contact.last_name || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const company = (contact.company || "").toLowerCase();
      const jobTitle = (contact.job_title || "").toLowerCase();
      const department = (contact.department || "").toLowerCase();

      return (
        firstName.includes(lowercaseSearch) ||
        lastName.includes(lowercaseSearch) ||
        fullName.includes(lowercaseSearch) ||
        company.includes(lowercaseSearch) ||
        jobTitle.includes(lowercaseSearch) ||
        department.includes(lowercaseSearch)
      );
    });
  };

  const groupContactsAlphabetically = (
    contacts: Contact[]
  ): ContactListItem[] => {
    const grouped: { [key: string]: Contact[] } = {};

    contacts.forEach((contact) => {
      const name =
        contact.first_name || contact.last_name || contact.company || "";
      const firstLetter = name.charAt(0).toLowerCase();
      const letter = firstLetter.match(/[a-z]/) ? firstLetter : "#";

      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(contact);
    });

    const flatList: ContactListItem[] = [];
    const sortedLetters = Object.keys(grouped).sort();

    sortedLetters.forEach((letter) => {
      flatList.push({ type: "header", letter });
      grouped[letter].forEach((contact) => {
        flatList.push({ type: "contact", contact });
      });
    });

    return flatList;
  };

  const renderItem = ({ item }: { item: ContactListItem }) => {
    return <ContactListElement item={item} searchTerm={searchTerm} />;
  };

  const filteredContacts = filterContacts(sortedContacts, searchTerm);
  const groupedContacts = groupContactsAlphabetically(filteredContacts);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "transparent",
        position: "absolute",
        top: groupedContacts.length === 0 ? 0 : 130,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {groupedContacts.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 100,
          }}
        >
          <Text
            style={{
              color: "#ccc",
              fontSize: 10,
              textAlign: "center",
              width: "70%",
              marginTop: 40,
            }}
          >
            {searchTerm.trim()
              ? `No contacts found for "${searchTerm}"`
              : "No saved connections yet, go on and start the journey"}
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={groupedContacts}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === "header"
              ? `header-${item.letter}`
              : `contact-${item.contact?.id}-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            paddingTop: 10,
          }}
        />
      )}
    </View>
  );
}
