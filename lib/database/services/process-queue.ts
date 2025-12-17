import { supabase } from "../../supabase";
import type {
  DatabaseResponse,
  JobType,
  Json,
  ProcessJob,
  ProcessJobInsert,
} from "../database.types";

export class ProcessQueueService {
  private static readonly TABLE_NAME = "process_queue";

  static async enqueue(params: {
    userId: string;
    contactId?: string | null;
    jobType: JobType;
    payload: Record<string, Json>;
  }): Promise<DatabaseResponse<ProcessJob>> {
    const { userId, contactId = null, jobType, payload } = params;

    try {
      if (jobType === "DETAILS_UPDATE") {
        const { data: existingJob, error: fetchError } = await supabase
          .from(this.TABLE_NAME)
          .select("*")
          .eq("contact_id", contactId)
          .eq("job_type", jobType)
          .eq("status", "pending")
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking for existing job:", fetchError);
        }

        if (existingJob) {
          const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .update({
              payload,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingJob.id)
            .select()
            .single();

          return { data, error };
        }
      }

      const jobData: ProcessJobInsert = {
        user_id: userId,
        contact_id: contactId,
        job_type: jobType,
        payload,
        status: "pending",
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(jobData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getPendingByContact(contactId: string): Promise<ProcessJob[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("contact_id", contactId)
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching pending jobs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching pending jobs:", error);
      return [];
    }
  }

  static async getPendingByUser(userId: string): Promise<ProcessJob[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching user pending jobs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching user pending jobs:", error);
      return [];
    }
  }

  static async cancel(jobId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("status", "pending");

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async getById(jobId: string): Promise<DatabaseResponse<ProcessJob>> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("id", jobId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
