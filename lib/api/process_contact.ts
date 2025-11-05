import { supabase } from "@/lib/supabase";
import { z } from "zod";

const ContactInfoSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().nullable().optional(),
  professional_context: z.string().nullable().optional(),
  personal_context: z.string().nullable().optional(),
  relationship_context: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

export async function processContactFromTranscript(
  transcript: string
): Promise<ContactInfo> {
  try {
    const { data, error } = await supabase.functions.invoke("talk-about-them", {
      body: { transcript },
    });
    if (error) {
      throw new Error(error.message || "Error al procesar el contacto");
    }

    const result = ContactInfoSchema.parse(data);
    return result;
  } catch (error: any) {
    if (error?.issues) {
      throw new Error(
        "El formato de la respuesta no es válido. Por favor, intenta describir el contacto de manera más clara o inténtalo de nuevo."
      );
    }

    if (
      error?.message?.includes("API key") ||
      error?.message?.includes("Incorrect API key")
    ) {
      throw new Error(
        "La clave de API de OpenAI no es válida. Contacta al administrador."
      );
    }

    if (
      error?.message?.includes("rate limit") ||
      error?.message?.includes("429")
    ) {
      throw new Error(
        "Límite de solicitudes alcanzado. Por favor, inténtalo de nuevo en unos momentos."
      );
    }

    console.error("Error processing contact:", error?.message || error);
    throw new Error(
      error?.message ||
        "No se pudo procesar la información del contacto. Por favor, inténtalo de nuevo."
    );
  }
}
