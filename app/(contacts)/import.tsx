import ImportContactSearchBar from "@/components/contacts/ImportContactSearchBar";
import LocalContactListElement from "@/components/contacts/LocalContactListElement";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/lib/hooks/useLegendState";
import {
  CommunicationChannel,
  stringifyCommunicationChannels,
} from "@/lib/types/communicationChannel";
import * as Contacts from "expo-contacts";
import { ExistingContact } from "expo-contacts";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import capture_event, { EVENT_TYPES } from "@/lib/posthog-helper";
import { usePostHog } from "posthog-react-native";

interface LocalContactListItem {
  type: "header" | "contact";
  letter?: string;
  contact?: ExistingContact;
}

export default function ImportContactScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createContact } = useContacts();
  const [localContacts, setLocalContacts] = useState<ExistingContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const posthog = usePostHog();

  useEffect(() => {
    capture_event(EVENT_TYPES.START_IMPORTING_NEW_CONTACT, posthog);
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.ID,
            Contacts.Fields.Name,
            Contacts.Fields.FirstName,
            Contacts.Fields.LastName,
            Contacts.Fields.PhoneNumbers,
          ],
        });

        const sortedContacts = data.sort((a, b) => {
          const nameA = (
            a.firstName ||
            a.lastName ||
            a.name ||
            ""
          ).toLowerCase();
          const nameB = (
            b.firstName ||
            b.lastName ||
            b.name ||
            ""
          ).toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setLocalContacts(sortedContacts);
      } else {
        Alert.alert(
          t("contacts.import.permissions_required_title"),
          t("contacts.import.permissions_required_message")
        );
        router.back();
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert(t("common.error"), t("contacts.import.load_error"));
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeString = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filterContacts = (
    contacts: ExistingContact[],
    searchTerm: string
  ): ExistingContact[] => {
    if (!searchTerm.trim()) {
      return contacts;
    }

    const normalizedSearch = normalizeString(searchTerm.trim());

    return contacts.filter((contact) => {
      const firstName = normalizeString(contact.firstName || "");
      const lastName = normalizeString(contact.lastName || "");
      const fullName = `${firstName} ${lastName}`.trim();
      const name = normalizeString(contact.name || "");
      const phoneNumbers =
        contact.phoneNumbers?.map((p) => p.number || "").join(" ") || "";

      return (
        firstName.includes(normalizedSearch) ||
        lastName.includes(normalizedSearch) ||
        fullName.includes(normalizedSearch) ||
        name.includes(normalizedSearch) ||
        phoneNumbers.includes(normalizedSearch)
      );
    });
  };

  const groupContactsAlphabetically = (
    contacts: ExistingContact[]
  ): LocalContactListItem[] => {
    const grouped: { [key: string]: ExistingContact[] } = {};

    contacts.forEach((contact) => {
      const name = contact.firstName || contact.lastName || contact.name || "";
      const firstLetter = name.charAt(0);
      const normalizedLetter = normalizeString(firstLetter);
      const letter = normalizedLetter.match(/[a-z]/i) ? normalizedLetter : "#";

      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(contact);
    });

    const flatList: LocalContactListItem[] = [];
    const sortedLetters = Object.keys(grouped).sort();

    sortedLetters.forEach((letter) => {
      flatList.push({ type: "header", letter });
      grouped[letter].forEach((contact) => {
        flatList.push({ type: "contact", contact });
      });
    });

    return flatList;
  };

  const handleImportContact = useCallback(
    async (localContact: ExistingContact) => {
      try {
        if (!user?.id) {
          Alert.alert(t("common.error"), t("common.user_not_authenticated"));
          return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const communicationChannels: CommunicationChannel[] = [];
        if (localContact.phoneNumbers && localContact.phoneNumbers.length > 0) {
          localContact.phoneNumbers.forEach((phone) => {
            communicationChannels.push({
              type: "tel",
              value: phone.number || "",
            });
          });
        }

        await createContact({
          first_name: localContact.firstName || "",
          last_name: localContact.lastName || "",
          details: "",
          communication_channels: stringifyCommunicationChannels(
            communicationChannels
          ),
          deleted: false,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        capture_event(EVENT_TYPES.IMPORTING_NEW_CONTACT_SUCCESS, posthog);

        router.back();
      } catch (error) {
        console.error("Error importing contact:", error);
        Alert.alert(t("common.error"), t("contacts.import.import_error"));
      }
    },
    [user?.id, createContact]
  );

  const renderItem = useCallback(
    ({ item }: { item: LocalContactListItem }) => {
      return (
        <LocalContactListElement
          item={item}
          onPress={() => {
            if (item.type === "contact" && item.contact) {
              handleImportContact(item.contact);
            }
          }}
        />
      );
    },
    [handleImportContact]
  );

  const filteredContacts = useMemo(
    () => filterContacts(localContacts, searchTerm),
    [localContacts, searchTerm]
  );

  const groupedContacts = useMemo(
    () => groupContactsAlphabetically(filteredContacts),
    [filteredContacts]
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          position: "absolute",
          top: 25,
          marginHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
          zIndex: 1000,
        }}
      >
        <ImportContactSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </View>

      {groupedContacts.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#ccc",
              fontSize: 10,
              textAlign: "center",
              width: "70%",
            }}
          >
            {searchTerm.trim()
              ? t("contacts.import.no_contacts_found", { searchTerm })
              : t("contacts.import.no_contacts_available")}
          </Text>
        </Animated.View>
      ) : (
        <View
          style={{
            height: "100%",
            position: "absolute",
            top: 90,
            width: "100%",
          }}
        >
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
              paddingBottom: 120,
            }}
            removeClippedSubviews={true}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
        </View>
      )}
    </View>
  );
}
