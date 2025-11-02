import { useAuth } from "@/contexts/AuthContext";
import { useSelector } from "@legendapp/state/react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import type { Contact, Interaction, Profile } from "../database/database.types";
import { contacts$, interactions$, profiles$ } from "../supaLegend";

export function useContacts() {
  const { user } = useAuth();

  const contacts = useSelector(() => {
    const allContacts = contacts$.get();
    if (!allContacts || !user) return [];

    return Object.values(allContacts).filter(
      (contact: any) => contact.owner_id === user.id && !contact.deleted
    ) as Contact[];
  });

  const createContact = (
    contact: Omit<Contact, "id" | "created_at" | "updated_at" | "owner_id">
  ) => {
    if (!user) throw new Error("User not authenticated");

    const id = uuidv4();

    // @ts-ignore
    contacts$[id].assign({
      id,
      owner_id: user.id,
      ...contact,
    });

    return contacts$[id].peek() as Contact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    // @ts-ignore
    const contact = contacts$[id].peek();
    if (!contact) throw new Error("Contact not found");

    // @ts-ignore
    contacts$[id].assign({
      ...updates,
      updated_at: new Date().toISOString(),
    });
  };

  const deleteContact = (id: string) => {
    // @ts-ignore
    const contact = contacts$[id].peek();
    if (!contact) throw new Error("Contact not found");

    // @ts-ignore
    contacts$[id].assign({
      deleted: true,
      updated_at: new Date().toISOString(),
    });
  };

  const getContact = (id: string): Contact | undefined => {
    // @ts-ignore
    const contact = contacts$[id].peek();
    if (!contact || contact.deleted) return undefined;
    return contact as Contact;
  };

  const searchContacts = (searchTerm: string): Contact[] => {
    const allContacts = contacts$.get();
    if (!allContacts || !user) return [];

    const term = searchTerm.toLowerCase();
    return Object.values(allContacts).filter(
      (contact: any) =>
        contact.owner_id === user.id &&
        !contact.deleted &&
        (contact.first_name?.toLowerCase().includes(term) ||
          contact.last_name?.toLowerCase().includes(term) ||
          contact.company?.toLowerCase().includes(term))
    ) as Contact[];
  };

  return {
    contacts,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    searchContacts,
  };
}

export function useInteractions() {
  const { user } = useAuth();

  const interactions = useSelector(() => {
    const allInteractions = interactions$.get();
    if (!allInteractions || !user) return [];

    return Object.values(allInteractions).filter(
      (interaction: any) =>
        interaction.owner_id === user.id && !interaction.deleted
    ) as Interaction[];
  });

  const unassignedInteractions = useSelector(() => {
    const allInteractions = interactions$.get();
    if (!allInteractions || !user) return [];

    return Object.values(allInteractions).filter(
      (interaction: any) =>
        interaction.owner_id === user.id &&
        !interaction.deleted &&
        !interaction.contact_id
    ) as Interaction[];
  });

  const getInteractionsByContact = (contactId: string): Interaction[] => {
    const allInteractions = interactions$.get();
    if (!allInteractions || !user) return [];

    return Object.values(allInteractions).filter(
      (interaction: any) =>
        interaction.owner_id === user.id &&
        !interaction.deleted &&
        interaction.contact_id === contactId
    ) as Interaction[];
  };

  const createInteraction = (
    interaction: Omit<
      Interaction,
      "id" | "created_at" | "updated_at" | "owner_id"
    >
  ) => {
    if (!user) throw new Error("User not authenticated");

    // Validate contact_id if provided
    if (interaction.contact_id) {
      // @ts-ignore
      const contact = contacts$[interaction.contact_id]?.peek();
      if (!contact || contact.deleted) {
        console.warn("⚠️ Invalid contact_id provided, setting to null");
        interaction.contact_id = null;
      }
    }

    const id = uuidv4();

    try {
      // @ts-ignore
      interactions$[id].assign({
        id,
        owner_id: user.id,
        ...interaction,
      });

      const created = interactions$[id].peek() as Interaction;
      return created;
    } catch (error) {
      console.error("❌ Error creating interaction:", error);
      throw error;
    }
  };

  const updateInteraction = (id: string, updates: Partial<Interaction>) => {
    // @ts-ignore
    const interaction = interactions$[id].peek();
    if (!interaction) throw new Error("Interaction not found");

    // Validate contact_id if being updated
    if (updates.contact_id) {
      // @ts-ignore
      const contact = contacts$[updates.contact_id]?.peek();
      if (!contact || contact.deleted) {
        console.warn("⚠️ Invalid contact_id provided, setting to null");
        updates.contact_id = null;
      }
    }

    // @ts-ignore
    interactions$[id].assign({
      ...updates,
      updated_at: new Date().toISOString(),
    });
  };

  const assignContact = (interactionId: string, contactId: string) => {
    // Validate that the contact exists before assigning
    // @ts-ignore
    const contact = contacts$[contactId]?.peek();
    if (!contact || contact.deleted) {
      throw new Error("Cannot assign interaction to non-existent or deleted contact");
    }
    updateInteraction(interactionId, { contact_id: contactId });
  };

  const deleteInteraction = (id: string) => {
    // @ts-ignore
    const interaction = interactions$[id].peek();
    if (!interaction) throw new Error("Interaction not found");

    // @ts-ignore
    interactions$[id].assign({
      deleted: true,
      updated_at: new Date().toISOString(),
    });
  };

  const getInteraction = (id: string): Interaction | undefined => {
    // @ts-ignore
    const interaction = interactions$[id].peek();
    if (!interaction || interaction.deleted) return undefined;
    return interaction as Interaction;
  };

  return {
    interactions,
    unassignedInteractions,
    getInteractionsByContact,
    createInteraction,
    updateInteraction,
    assignContact,
    deleteInteraction,
    getInteraction,
  };
}

export function useProfile() {
  const { user } = useAuth();

  const profile = useSelector(() => {
    if (!user) return null;
    // @ts-ignore
    const userProfile = profiles$[user.id].peek();
    if (!userProfile || userProfile.deleted) return null;
    return userProfile as Profile;
  });

  const updateProfile = (updates: Partial<Profile>) => {
    if (!user) throw new Error("User not authenticated");

    // @ts-ignore
    const currentProfile = profiles$[user.id].peek();
    if (!currentProfile) {
      // @ts-ignore
      profiles$[user.id].set({
        user_id: user.id,
        onboarding_done: false,
        ...updates,
      });
    } else {
      // @ts-ignore
      profiles$[user.id].set({
        ...currentProfile,
        ...updates,
      });
    }
  };

  return {
    profile,
    updateProfile,
  };
}

export function useSyncStatus() {
  const contactsSyncStatus = useSelector(() => {
    return { syncing: false };
  });

  return {
    contactsSyncStatus,
  };
}
