import { supabase } from "../../supabase";
import type {
  Contact,
  ContactInsert,
  ContactUpdate,
  DatabaseListResponse,
  DatabaseResponse,
} from "../database.types";

export class ContactsService {
  private static readonly TABLE_NAME = "contacts";

  /**
   * Create a new contact
   */
  static async create(
    contact: ContactInsert
  ): Promise<DatabaseResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...contact,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get contact by ID
   */
  static async getById(id: string): Promise<DatabaseResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all contacts for a user
   */
  static async getByOwnerId(
    ownerId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: keyof Contact;
      ascending?: boolean;
    }
  ): Promise<DatabaseListResponse<Contact>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId);

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? true,
        });
      } else {
        // Default ordering by created_at desc
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      return { data, error, count: count || 0 };
    } catch (error) {
      return { data: null, error: error as Error, count: 0 };
    }
  }

  /**
   * Search contacts by name or company
   */
  static async search(
    ownerId: string,
    searchTerm: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<DatabaseListResponse<Contact>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId)
        .or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      return { data, error, count: count || 0 };
    } catch (error) {
      return { data: null, error: error as Error, count: 0 };
    }
  }

  /**
   * Update a contact
   */
  static async update(
    id: string,
    updates: ContactUpdate
  ): Promise<DatabaseResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a contact
   */
  static async delete(id: string): Promise<DatabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("id", id);

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get contacts with recent interactions
   */
  static async getWithRecentInteractions(
    ownerId: string,
    limit: number = 10
  ): Promise<DatabaseListResponse<Contact & { interaction_count: number }>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select(
          `
          *,
          interactions!inner(count)
        `
        )
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
