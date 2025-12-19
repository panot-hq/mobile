import { supabase } from "@/lib/supabase";

export default async function handleFeedbackSubmit(
  feedbackType: string,
  feedbackText: string,
  isAnonymous: boolean,
  user_email?: string
) {
  try {
    if (isAnonymous || !user_email) {
      const { data, error } = await supabase
        .from("feedback_tickets")
        .insert([
          {
            feedback_type: feedbackType,
            message: feedbackText,
          },
        ])
        .select();

      if (error) {
        throw error;
      }
    } else {
      const { data, error } = await supabase
        .from("feedback_tickets")
        .insert([
          {
            feedback_type: feedbackType,
            message: feedbackText,
            sender_email: user_email,
          },
        ])
        .select();

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
  }
}
