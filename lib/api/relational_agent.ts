import { supabase } from "@/lib/supabase";

export async function callRelationalAgent(
  transcript: string,
  mode: string,
  contact_id?: string,
  user_id?: string
) {
  let error: any;
  let data: any;
  if (!contact_id) {
    const response = await supabase.functions.invoke("relational-agent", {
      body: { transcript, mode, user_id },
    });
    data = response.data;
    error = response.error;
  } else {
    const response = await supabase.functions.invoke("relational-agent", {
      body: { transcript, mode, user_id, contact_id },
    });
    data = response.data;
    error = response.error;
  }

  if (error) {
    throw error;
  }

  return data;
}
