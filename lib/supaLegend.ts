import { observable, Observable } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { configureSynced } from "@legendapp/state/sync";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";

const generateId = () => uuidv4();

const customSynced = configureSynced(syncedSupabase, {
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
  generateId,
  supabase,
  changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  fieldDeleted: "deleted",
});

export const contacts$: Observable<any> = observable(
  // @ts-ignore
  customSynced({
    supabase,
    collection: "contacts",
    select: (from: any) =>
      from.select(
        "id,owner_id,first_name,last_name,professional_context,personal_context,relationship_context,details,birthday,created_at,updated_at,deleted,communication_channels"
      ),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "contacts",
      retrySync: true,
    },
    retry: {
      infinite: true,
    },
    onError: (error: any) => {
      const errorMessage = error?.message || String(error);
      const isNetworkError =
        errorMessage.includes("fetch") ||
        errorMessage.includes("network") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Unable to resolve host");

      if (!isNetworkError) {
        console.error("❌ Contacts sync error:", error);
      }
    },
  })
);

export const interactions$: Observable<any> = observable(
  // @ts-ignore
  customSynced({
    supabase,
    collection: "interactions",
    select: (from: any) =>
      from.select(
        "id,owner_id,raw_content,key_concepts,contact_id,created_at,updated_at,deleted"
      ),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "interactions",
      retrySync: true,
    },
    retry: {
      infinite: true,
    },
    onError: (error: any) => {
      const errorMessage = error?.message || String(error);
      const isNetworkError =
        errorMessage.includes("fetch") ||
        errorMessage.includes("network") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Unable to resolve host");

      if (!isNetworkError) {
        console.error("❌ Interactions sync error:", error);
      }
    },
  })
);

export const profiles$: Observable<any> = observable(
  // @ts-ignore
  customSynced({
    supabase,
    collection: "profiles",
    select: (from: any) =>
      from.select("user_id,onboarding_done,created_at,updated_at,deleted"),
    actions: ["read", "create", "update"],
    realtime: true,
    persist: {
      name: "profiles",
      retrySync: true,
    },
    retry: {
      infinite: true,
    },
  })
);

export async function initializeSync(userId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return;
    }

    if (session.user.id !== userId) {
      return;
    }

    const contactsData = contacts$.get();
    const interactionsData = interactions$.get();
    const profilesData = profiles$.get();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clean up any orphaned interactions after data is loaded
    await cleanupOrphanedInteractions();
  } catch (error) {
    console.error("Error initializing sync:", error);
  }
}

export async function clearPersistedData() {
  try {
    await AsyncStorage.removeItem("contacts");
    await AsyncStorage.removeItem("interactions");
    await AsyncStorage.removeItem("profiles");
  } catch (error) {
    console.error("Error clearing persisted data:", error);
  }
}

export async function cleanupOrphanedInteractions() {
  try {
    const allInteractions = interactions$.get();
    const allContacts = contacts$.get();

    if (!allInteractions || !allContacts) return;

    let cleanedCount = 0;

    Object.entries(allInteractions).forEach(
      ([id, interaction]: [string, any]) => {
        // Skip if no contact_id (these are valid unassigned interactions)
        if (!interaction.contact_id) return;

        // Check if the contact exists
        const contact = allContacts[interaction.contact_id];
        if (!contact || contact.deleted) {
          console.warn(
            `🧹 Cleaning up orphaned interaction ${id} with invalid contact_id: ${interaction.contact_id}`
          );
          // Set contact_id to null instead of deleting the interaction
          // @ts-ignore
          interactions$[id].assign({
            contact_id: null,
            updated_at: new Date().toISOString(),
          });
          cleanedCount++;
        }
      }
    );

    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} orphaned interaction(s)`);
    }
  } catch (error) {
    console.error("Error cleaning up orphaned interactions:", error);
  }
}
