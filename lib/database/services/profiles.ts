import { supabase } from "../../supabase";
import type {
  DatabaseResponse,
  Profile,
  ProfileInsert,
  ProfileUpdate,
} from "../types";

export class ProfilesService {
  private static readonly TABLE_NAME = "profiles";

  /**
   * Create a new profile
   */
  static async create(
    profile: ProfileInsert
  ): Promise<DatabaseResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...profile,
          onboarding_done: profile.onboarding_done ?? false,
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
   * Get profile by user ID
   */
  static async getByUserId(userId: string): Promise<DatabaseResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a profile
   */
  static async update(
    userId: string,
    updates: ProfileUpdate
  ): Promise<DatabaseResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a profile
   */
  static async delete(userId: string): Promise<DatabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("user_id", userId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Mark onboarding as complete
   */
  static async completeOnboarding(
    userId: string
  ): Promise<DatabaseResponse<Profile>> {
    return this.update(userId, { onboarding_done: true });
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.getByUserId(userId);

      if (error || !data) {
        return false;
      }

      return data.onboarding_done;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get or create profile for user
   * Useful for ensuring a profile exists when a user signs up
   */
  static async getOrCreate(userId: string): Promise<DatabaseResponse<Profile>> {
    try {
      // First try to get existing profile
      const existingProfile = await this.getByUserId(userId);

      if (existingProfile.data && !existingProfile.error) {
        return existingProfile;
      }

      // If no profile exists, create one
      return await this.create({ user_id: userId });
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
