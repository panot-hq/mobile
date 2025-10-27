import { useAuth } from "@/contexts/AuthContext";
import { useContacts as useContactsContext } from "@/contexts/ContactsContext";
import { useRecording } from "@/contexts/RecordingContext";
import { Contact } from "@/lib/database/database.types";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import ContactListElement from "../contacts/ContactListElement";

interface ContactGroup {
  letter: string;
  contacts: Contact[];
}

interface ContactListItem {
  type: "header" | "contact";
  letter?: string;
  contact?: Contact;
}

interface AssignContactsListProps {
  interactionId?: string;
  isRecordingMode?: boolean;
}

export default function AssignContactsList({
  interactionId,
  isRecordingMode = false,
}: AssignContactsListProps) {
  const { user } = useAuth();
  const { searchTerm } = useContactsContext();
  const { contacts } = useContacts();
  const { assignContact } = useInteractions();
  const { setAssignedContactId } = useRecording();

  // Sort contacts alphabetically
  const sortedContacts = React.useMemo(() => {
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

  const handleAssignContact = async (contactId: string) => {
    try {
      if (isRecordingMode) {
        setAssignedContactId(contactId);
        router.back();
      } else if (interactionId) {
        assignContact(interactionId, contactId);
        router.back();
      }
    } catch (error) {
      console.error("Error assigning contact:", error);
    }
  };

  const renderItem = ({ item }: { item: ContactListItem }) => {
    return (
      <ContactListElement
        item={item}
        searchTerm={searchTerm}
        onPress={() => {
          if (item.type === "contact" && item.contact) {
            handleAssignContact(item.contact.id);
          }
        }}
      />
    );
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
