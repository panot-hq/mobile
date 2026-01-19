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

      const matchesName =
        firstName.includes(normalizedSearch) ||
        lastName.includes(normalizedSearch) ||
        fullName.includes(normalizedSearch);

      let matchesSummary = false;
      if (contact.details) {
        const summary =
          typeof contact.details === "object" &&
          contact.details !== null &&
          "summary" in contact.details
            ? (contact.details as { summary?: string }).summary
            : typeof contact.details === "string"
            ? contact.details
            : null;

        if (summary && typeof summary === "string" && summary.trim().length > 0) {
          const normalizedSummary = normalizeString(summary);
          matchesSummary = normalizedSummary.includes(normalizedSearch);
        }
      }

      return matchesName || matchesSummary;
    });
  };

  const groupContactsAlphabetically = (
    contacts: Contact[]
  ): ContactListItem[] => {
    const defaultName = t("contacts.new.default_name");
    const defaultNameLower = defaultName.toLowerCase();

    const contactsWithSummary: Contact[] = [];
    const contactsWithoutSummary: Contact[] = [];
    const temporaryContacts: Contact[] = [];

    contacts.forEach((contact) => {
      const summary = (contact.details as any)?.summary;
      const hasDetailsSummary =
        summary !== null &&
        summary !== undefined &&
        typeof summary === "string"

      if (hasDetailsSummary) {
        contactsWithSummary.push(contact);
      } else {
        const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim().toLowerCase();
        const isTemporary = fullName === defaultNameLower;

        if (isTemporary) {
          temporaryContacts.push(contact);
        } else {
          contactsWithoutSummary.push(contact);
        }
      }
    });

    const recentContactsWithoutSummary = contactsWithoutSummary.filter((contact) => {
      const createdAt = contact.created_at
        ? new Date(contact.created_at).getTime()
        : 0;
      return createdAt;
    });

    const recentContactsWithRealName = recentContactsWithoutSummary.filter((contact) => {
      const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim().toLowerCase();
      return fullName !== defaultNameLower && fullName.length > 0;
    });

    const shouldShowTemporaryContacts = recentContactsWithRealName.length === 0;

    const flatList: ContactListItem[] = [];

    if (shouldShowTemporaryContacts && temporaryContacts.length > 0) {
      const recentTemporaryContacts = temporaryContacts.filter((contact) => {
        const createdAt = contact.created_at
          ? new Date(contact.created_at).getTime()
          : 0;
        return createdAt;
      });

      recentTemporaryContacts.forEach((contact) => {
        flatList.push({
          type: "contact",
          contact,
          hasDetailsSummary: false,
        });
      });
    }

    if (recentContactsWithRealName.length > 0) {
      recentContactsWithRealName.forEach((contact) => {
        flatList.push({
          type: "contact",
          contact,
          hasDetailsSummary: false,
        });
      });
    }

    if (contactsWithSummary.length > 0) {
      const grouped: { [key: string]: Contact[] } = {};

      contactsWithSummary.forEach((contact) => {
        const name = contact.first_name || contact.last_name || "";
        const firstLetter = name.charAt(0);
        const normalizedLetter = normalizeString(firstLetter);
        const letter = normalizedLetter.match(/[a-z]/i)
          ? normalizedLetter
          : "#";

        if (!grouped[letter]) {
          grouped[letter] = [];
        }
        grouped[letter].push(contact);
      });

      const sortedLetters = Object.keys(grouped).sort();

      sortedLetters.forEach((letter) => {
        flatList.push({ type: "header", letter });
        grouped[letter].forEach((contact) => {
          flatList.push({
            type: "contact",
            contact,
            hasDetailsSummary: true,
          });
        });
      });
    }

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
