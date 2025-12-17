import { Contact } from "@/lib/database/database.types";
import { useContacts as useLegendContacts } from "@/lib/hooks/useLegendState";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  hasDetailsSummary?: boolean;
}

interface ContactListProps {
  searchTerm?: string;
}

export default function ContactList({ searchTerm = "" }: ContactListProps) {
  const { t } = useTranslation();
  const { contacts } = useLegendContacts();

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const nameA = (a.first_name || a.last_name || "").toLowerCase();
      const nameB = (b.first_name || b.last_name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [contacts]);

  const normalizeString = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filterContacts = (
    contacts: Contact[],
    searchTerm: string
  ): Contact[] => {
    if (!searchTerm.trim()) {
      return contacts;
    }

    const normalizedSearch = normalizeString(searchTerm.trim());

    return contacts.filter((contact) => {
      const firstName = normalizeString(contact.first_name || "");
      const lastName = normalizeString(contact.last_name || "");
      const fullName = `${firstName} ${lastName}`.trim();

      return (
        firstName.includes(normalizedSearch) ||
        lastName.includes(normalizedSearch) ||
        fullName.includes(normalizedSearch)
      );
    });
  };

  const groupContactsAlphabetically = (
    contacts: Contact[]
  ): ContactListItem[] => {
    const grouped: { [key: string]: Contact[] } = {};

    contacts.forEach((contact) => {
      const name = contact.first_name || contact.last_name || "";
      const firstLetter = name.charAt(0);
      const normalizedLetter = normalizeString(firstLetter);
      const letter = normalizedLetter.match(/[a-z]/i) ? normalizedLetter : "#";

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
        const hasDetailsSummary =
          (contact.details as any)?.summary !== null ? true : false;
        flatList.push({ type: "contact", contact, hasDetailsSummary });
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
              ? t("contacts.list.no_contacts_found_for", { searchTerm })
              : t("contacts.list.no_saved_connections")}
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
