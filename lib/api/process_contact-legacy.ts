import { supabase } from "@/lib/supabase";
import { z } from "zod";

const ContactInfoSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().transform((val) => val || ""),
  details: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || ""),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

export async function processContactFromTranscript(
  transcript: string,
  displayName?: string
): Promise<ContactInfo> {
  try {
    const response = await supabase.functions.invoke("talk-about-them", {
      body: { transcript, displayName },
    });

    const { data, error } = response;

    if (error) {
      console.error("Edge function error object:", {
        message: error.message,
        name: error.name,
        context: error.context,
        details: error,
      });

      if (error.context?.status === 404) {
        throw new Error(
          "Servicio temporalmente no disponible. Por favor, intenta de nuevo en unos minutos."
        );
      }

      if (error.context?.status >= 500) {
        throw new Error(
          "Error del servidor. Por favor, intenta de nuevo más tarde."
        );
      }

      throw new Error(error.message || "Error al procesar el contacto");
    }

    if (!data) {
      throw new Error("No se recibió respuesta de la edge function");
    }

    if (data.error) {
      console.error("Edge function returned error in data:", data.error);
      throw new Error(data.error);
    }

    const result = ContactInfoSchema.parse(data);

    return result;
  } catch (error: any) {
    console.error("Full error details:", {
      message: error?.message,
      name: error?.name,
      issues: error?.issues,
      cause: error?.cause,
      stack: error?.stack,
    });

    if (error?.issues) {
      console.error("Zod validation errors:", error.issues);
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
