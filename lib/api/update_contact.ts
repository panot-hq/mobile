import { Contact } from "@/lib/database/database.types";
import { supabase } from "@/lib/supabase";
import { contacts$ } from "@/lib/supaLegend";
import { z } from "zod";

const ContextSchema = z
  .object({
    personal: z
      .object({
        situacion_vital: z.string().optional(),
        preferencias: z.array(z.string()).optional(),
        necesidades: z.array(z.string()).optional(),
        intereses: z.array(z.string()).optional(),
        otros: z.record(z.any()).optional(),
      })
      .optional(),
    profesional: z
      .object({
        situacion_laboral: z.string().optional(),
        empresa: z.string().optional(),
        puesto: z.string().optional(),
        preferencias_laborales: z.array(z.string()).optional(),
        habilidades: z.array(z.string()).optional(),
        proyectos: z.array(z.string()).optional(),
      })
      .optional(),
    relacion: z
      .object({
        como_se_conocieron: z.string().optional(),
        intereses_comunes: z.array(z.string()).optional(),
        tipo_relacion: z.string().optional(),
        ultima_interaccion: z.string().optional(),
        receptividad_colaboracion: z.string().optional(),
      })
      .optional(),
  })
  .nullable()
  .optional();

const UpdateResponseSchema = z.object({
  has_updates: z.boolean(),
  full_context: ContextSchema.optional(),
  full_details: z.string().optional(),
  updates: z
    .object({
      context: z
        .object({
          personal: z.record(z.any()).optional(),
          profesional: z.record(z.any()).optional(),
          relacion: z.record(z.any()).optional(),
        })
        .optional(),
      details_addition: z.string().optional(),
    })
    .optional(),
});

export type UpdateResponse = z.infer<typeof UpdateResponseSchema>;

export interface UpdateContactParams {
  transcript: string;
  contact: Contact;
  displayName?: string;
}

export async function updateContactFromInteraction(
  params: UpdateContactParams
): Promise<UpdateResponse> {
  const { transcript, contact, displayName } = params;

  try {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("El transcript no puede estar vacío");
    }
    if (!contact.first_name) {
      throw new Error("El contacto debe tener al menos un nombre");
    }

    const contactData = {
      first_name: contact.first_name,
      last_name: contact.last_name || "",
      context: contact.context || null,
      details: contact.details || "",
    };

    const response = await supabase.functions.invoke("update-contact", {
      body: {
        transcript,
        contact: contactData,
        displayName,
      },
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

      if (error.context?.status === 401) {
        throw new Error(
          "Error de autenticación con el servicio de IA. Contacta al administrador."
        );
      }

      throw new Error(error.message || "Error al actualizar el contacto");
    }

    if (!data) {
      throw new Error("No se recibió respuesta de la edge function");
    }

    if (data.error) {
      console.error("Edge function returned error in data:", data.error);
      throw new Error(data.error);
    }

    const result = UpdateResponseSchema.parse(data);

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
        "El formato de la respuesta no es válido. Por favor, inténtalo de nuevo."
      );
    }

    if (
      error?.message?.includes("API key") ||
      error?.message?.includes("Incorrect API key") ||
      error?.message?.includes("clave de API")
    ) {
      throw new Error(
        "La clave de API de OpenAI no es válida. Contacta al administrador."
      );
    }

    if (
      error?.message?.includes("rate limit") ||
      error?.message?.includes("429") ||
      error?.message?.includes("Límite de solicitudes")
    ) {
      throw new Error(
        "Límite de solicitudes alcanzado. Por favor, inténtalo de nuevo en unos momentos."
      );
    }

    if (error?.message) {
      throw error;
    }
    throw new Error(
      "No se pudo actualizar la información del contacto. Por favor, inténtalo de nuevo."
    );
  }
}

export async function applyContactUpdates(
  contactId: string,
  updateResponse: UpdateResponse
): Promise<Contact | null> {
  if (!updateResponse.has_updates) {
    return null;
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateResponse.full_context) {
      updateData.context = updateResponse.full_context;
    }

    if (updateResponse.full_details) {
      updateData.details = updateResponse.full_details;
    }

    // @ts-ignore
    const currentContact = contacts$[contactId].peek();
    if (currentContact) {
      // @ts-ignore
      contacts$[contactId].assign(updateData);
    }

    const { data, error } = await supabase
      .from("contacts")
      .update(updateData)
      .eq("id", contactId)
      .select()
      .single();

    if (error) {
      console.error("Error updating contact in database:", error);
      if (currentContact) {
        // @ts-ignore
        contacts$[contactId].set(currentContact);
      }
      throw new Error("No se pudo guardar la actualización del contacto");
    }

    return data;
  } catch (error: any) {
    console.error("Error applying contact updates:", error);
    throw new Error(
      error?.message || "Error al aplicar las actualizaciones al contacto"
    );
  }
}
