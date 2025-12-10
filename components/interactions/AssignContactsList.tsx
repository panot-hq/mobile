import { useAuth } from "@/contexts/AuthContext";
import { useContacts as useContactsContext } from "@/contexts/ContactsContext";
import { useRecording } from "@/contexts/RecordingContext";
import { Contact } from "@/lib/database/database.types";
import { ProcessQueueService } from "@/lib/database/services/process-queue";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import * as Haptics from "expo-haptics";
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
  hasDetailsSummary?: boolean;
}

interface AssignContactsListProps {
  interactionId?: string;
  isRecordingMode?: boolean;
  autoProcess?: boolean;
}

export default function AssignContactsList({
  interactionId,
  isRecordingMode = false,
  autoProcess = false,
}: AssignContactsListProps) {
  const { user } = useAuth();
  const { searchTerm } = useContactsContext();
  const { contacts, getContact } = useContacts();
  const { assignContact, getInteraction, updateInteraction } =
    useInteractions();
  const { setAssignedContactId } = useRecording();

  const normalizeString = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const sortedContacts = React.useMemo(() => {
    return [...contacts].sort((a, b) => {
      const nameA = (a.first_name || a.last_name || "").toLowerCase();
      const nameB = (b.first_name || b.last_name || "").toLowerCase();
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

  const handleAssignContact = async (contactId: string) => {
    try {
      if (isRecordingMode) {
        setAssignedContactId(contactId);
        router.back();
      } else if (interactionId) {
        assignContact(interactionId, contactId);

        router.back();

        if (autoProcess) {
          setTimeout(async () => {
            const interaction = getInteraction(interactionId);
            const contact = getContact(contactId);

            if (interaction && contact) {
              try {
                await ProcessQueueService.enqueue({
                  userId: user!.id,
                  contactId: contact.id,
                  jobType: "INTERACTION_TRANSCRIPT",
                  payload: {
                    transcript: interaction.raw_content,
                    interaction_id: interaction.id,
                  },
                });
                updateInteraction(interaction.id, {
                  status: "processing",
                });

                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              } catch (error: any) {
                console.error("Error enqueuing auto-process:", error);
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                );
              }
            }
          }, 300);
        }
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
