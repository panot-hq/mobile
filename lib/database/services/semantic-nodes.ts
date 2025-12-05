import { supabase } from "../../supabase";
import type { SemanticNode, SemanticNodeInsert } from "../database.types";

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export class SemanticNodesService {
  private static readonly TABLE_NAME = "semantic_nodes";

  /**
   * Create a new semantic node
   */
  static async create(
    node: SemanticNodeInsert
  ): Promise<DatabaseResponse<SemanticNode>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...node,
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
   * Create a CONTACT type node for a new contact
   */
  static async createContactNode(
    userId: string,
    label: string
  ): Promise<DatabaseResponse<SemanticNode>> {
    return this.create({
      user_id: userId,
      label,
      type: "CONTACT",
      weight: 1,
    });
  }

  /**
   * Get node by ID
   */
  static async getById(id: string): Promise<DatabaseResponse<SemanticNode>> {
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
   * Update a semantic node
   */
  static async update(
    id: string,
    updates: Partial<SemanticNode>
  ): Promise<DatabaseResponse<SemanticNode>> {
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
   * Delete a semantic node
   */
  static async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("id", id);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
