import { supabase } from "../../supabase";
import type {
  DatabaseListResponse,
  DatabaseResponse,
  Interaction,
  InteractionInsert,
  InteractionUpdate,
} from "../database.types";

export class InteractionsService {
  private static readonly TABLE_NAME = "interactions";

  /**
   * Create a new interaction
   */
  static async create(
    interaction: InteractionInsert
  ): Promise<DatabaseResponse<Interaction>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...interaction,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get interaction by ID
   */
  static async getById(id: string): Promise<DatabaseResponse<Interaction>> {
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
   * Get all interactions for a user
   */
  static async getByOwnerId(
    ownerId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: keyof Interaction;
      ascending?: boolean;
    }
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId);

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? false,
        });
      } else {
        // Default ordering by created_at desc (most recent first)
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
   * Get unassigned interactions for a user (interactions without contact_id)
   */
  static async getUnassignedByOwnerId(
    ownerId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: keyof Interaction;
      ascending?: boolean;
    }
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId)
        .is("contact_id", null);

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? false,
        });
      } else {
        // Default ordering by created_at desc (most recent first)
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
   * Get interactions for a specific contact
   */
  static async getByContactId(
    contactId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: keyof Interaction;
      ascending?: boolean;
    }
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("contact_id", contactId);

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? false,
        });
      } else {
        // Default ordering by created_at desc (most recent first)
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
   * Search interactions by content
   */
  static async search(
    ownerId: string,
    searchTerm: string,
    options?: {
      limit?: number;
      offset?: number;
      contactId?: string;
    }
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId)
        .ilike("raw_content", `%${searchTerm}%`)
        .order("created_at", { ascending: false });

      // Filter by contact if specified
      if (options?.contactId) {
        query = query.eq("contact_id", options.contactId);
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
   * Update an interaction
   */
  static async update(
    id: string,
    updates: InteractionUpdate
  ): Promise<DatabaseResponse<Interaction>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete an interaction
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
   * Get interactions with contact information
   */
  static async getWithContactInfo(
    ownerId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<DatabaseListResponse<Interaction & { contact: any }>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select(
          `
          *,
          contacts (
            id,
            first_name,
            last_name,
            company
          )
        `
        )
        .eq("owner_id", ownerId)
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

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get recent interactions (last 7 days)
   */
  static async getRecent(
    ownerId: string,
    days: number = 7,
    limit: number = 50
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const { data, error, count } = await supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId)
        .gte("created_at", dateThreshold.toISOString())
        .order("created_at", { ascending: false })
        .limit(limit);

      return { data, error, count: count || 0 };
    } catch (error) {
      return { data: null, error: error as Error, count: 0 };
    }
  }

  /**
   * Assign a contact to an interaction
   */
  static async assignContact(
    interactionId: string,
    contactId: string
  ): Promise<DatabaseResponse<Interaction>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({ contact_id: contactId })
        .eq("id", interactionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Has contact assigned to an interaction
   */
  static async hasContactAssigned(
    interactionId: string
  ): Promise<DatabaseResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("id", interactionId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Mark an interaction as processed
   */
  static async markAsProcessed(
    interactionId: string
  ): Promise<DatabaseResponse<Interaction>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({ processed: true, updated_at: new Date().toISOString() })
        .eq("id", interactionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get unprocessed interactions for a user
   */
  static async getUnprocessedByOwnerId(
    ownerId: string,
    options?: {
      limit?: number;
      offset?: number;
      onlyAssigned?: boolean; // Solo interacciones asignadas a un contacto
    }
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId)
        .eq("processed", false)
        .order("created_at", { ascending: false });

      // Filter only assigned interactions if specified
      if (options?.onlyAssigned) {
        query = query.not("contact_id", "is", null);
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
   * Get unprocessed interactions for a specific contact
   */
  static async getUnprocessedByContactId(
    contactId: string
  ): Promise<DatabaseListResponse<Interaction>> {
    try {
      const { data, error, count } = await supabase
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" })
        .eq("contact_id", contactId)
        .eq("processed", false)
        .order("created_at", { ascending: false });

      return { data, error, count: count || 0 };
    } catch (error) {
      return { data: null, error: error as Error, count: 0 };
    }
  }
}
