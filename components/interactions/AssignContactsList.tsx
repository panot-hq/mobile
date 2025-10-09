import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/contexts/ContactsContext";
import { useInteraction } from "@/contexts/InteractionContext";
import { ContactsService, InteractionsService } from "@/lib/database/index";
import { Contact } from "@/lib/database/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  interactionId: string;
}

export default function AssignContactsList({
  interactionId,
}: AssignContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { refreshTrigger, searchTerm } = useContacts();
  const { triggerRefresh } = useInteraction();

  useEffect(() => {
    loadContacts();
  }, [user, refreshTrigger]);

  const loadContacts = async () => {
    if (!user?.id) {
      console.log("No user ID found");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      /*    // Mock data for testing
      const mockContacts: Contact[] = [
        {
          id: "1",
          owner_id: user.id,
          first_name: "Ana",
          last_name: "García",
          company: "Tech Corp",
          job_title: "Developer",
        },
        {
          id: "2",
          owner_id: user.id,
          first_name: "Alicia",
          last_name: "Gómez",
          company: "Alpha Solutions",
          job_title: "Analyst",
        },
        {
          id: "3",
          owner_id: user.id,
          first_name: "Andrés",
          last_name: "Gutiérrez",
          company: "Apex Media",
          job_title: "Account Manager",
        },
        {
          id: "4",
          owner_id: user.id,
          first_name: "Beatriz",
          last_name: "Martín",
          job_title: "Manager",
        },
        {
          id: "5",
          owner_id: user.id,
          first_name: "Bruno",
          last_name: "Mendoza",
          company: "BetaTech",
          job_title: "Backend Developer",
        },
        {
          id: "6",
          owner_id: user.id,
          first_name: "Bárbara",
          last_name: "Morales",
          company: "BlueSky",
          job_title: "Brand Manager",
        },
        {
          id: "7",
          owner_id: user.id,
          first_name: "Carlos",
          last_name: "López",
          company: "Design Studio",
        },
        {
          id: "8",
          owner_id: user.id,
          first_name: "Cecilia",
          last_name: "Luna",
          company: "Creative Minds",
          job_title: "Consultant",
        },
        {
          id: "9",
          owner_id: user.id,
          first_name: "Cristina",
          last_name: "León",
          company: "CloudNet",
          job_title: "Customer Success",
        },
        {
          id: "10",
          owner_id: user.id,
          first_name: "David",
          last_name: "Sánchez",
          company: "InnovateX",
          job_title: "Product Owner",
        },
        {
          id: "11",
          owner_id: user.id,
          first_name: "Daniela",
          last_name: "Santos",
          company: "DataWorks",
          job_title: "Data Scientist",
        },
        {
          id: "12",
          owner_id: user.id,
          first_name: "Diego",
          last_name: "Suárez",
          company: "DriveNow",
          job_title: "Delivery Lead",
        },
        {
          id: "13",
          owner_id: user.id,
          first_name: "Elena",
          last_name: "Ruiz",
          company: "Health Solutions",
          job_title: "Nurse",
        },
        {
          id: "14",
          owner_id: user.id,
          first_name: "Eduardo",
          last_name: "Ramos",
          company: "EcoLife",
          job_title: "Engineer",
        },
        {
          id: "15",
          owner_id: user.id,
          first_name: "Esteban",
          last_name: "Reyes",
          company: "Eventia",
          job_title: "Event Planner",
        },
      ];

      setContacts(mockContacts);
*/
      // Real API call (commented out for testing)

      const { data, error } = await ContactsService.getByOwnerId(user.id, {
        orderBy: "first_name",
        ascending: true,
      });

      if (error) {
        console.error("Error loading contacts:", error);
      } else {
        setContacts(data || []);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const { data, error } = await InteractionsService.assignContact(
        interactionId,
        contactId
      );

      triggerRefresh();
      router.back();
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Cargando contactos...</Text>
      </View>
    );
  }

  const filteredContacts = filterContacts(contacts, searchTerm);
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
