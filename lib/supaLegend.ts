import { observable } from "@legendapp/state";
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

export const contacts$ = observable(
  // @ts-ignore
  customSynced({
    supabase,
    collection: "contacts",
    select: (from: any) =>
      from.select(
        "id,owner_id,first_name,last_name,company,job_title,department,address,birthday,notes,created_at,updated_at,deleted,communication_channels"
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

export const interactions$ = observable(
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

export const profiles$ = observable(
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
      console.error("❌ No Supabase session found");
      return;
    }

    if (session.user.id !== userId) {
      console.error("❌ User ID mismatch");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("❌ Error initializing sync:", error);
  }
}

export function clearSync() {
  contacts$.set({});
  interactions$.set({});
  profiles$.set({});
}
