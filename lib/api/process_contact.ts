import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import Constants from "expo-constants";
import { z } from "zod";

// Schema para la información del contacto extraída
const ContactInfoSchema = z.object({
  first_name: z.string().describe("El nombre del contacto"),
  last_name: z.string().describe("El apellido del contacto"),
  company: z
    .string()
    .optional()
    .describe("La empresa donde trabaja el contacto"),
  job_title: z
    .string()
    .optional()
    .describe("El puesto o título de trabajo del contacto"),
  department: z
    .string()
    .optional()
    .describe("El departamento donde trabaja el contacto"),
  address: z.string().optional().describe("La dirección del contacto"),
  notes: z
    .string()
    .optional()
    .describe("Notas adicionales o información relevante sobre el contacto"),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// Get OpenAI API key from environment variables
const getOpenAIApiKey = () => {
  // En Expo, las variables deben tener el prefijo EXPO_PUBLIC_ para ser accesibles
  const apiKey =
    Constants.expoConfig?.extra?.openaiApiKey ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  return apiKey;
};

/**
 * Procesa un texto transcrito y extrae información estructurada del contacto usando OpenAI
 * @param transcript El texto transcrito que describe al contacto
 * @returns Información estructurada del contacto
 */
export async function processContactFromTranscript(
  transcript: string
): Promise<ContactInfo> {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file."
    );
  }

  const openai = createOpenAI({
    apiKey,
  });

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ContactInfoSchema,
      prompt: `Analiza el siguiente texto sobre un contacto y extrae toda la información relevante de forma estructurada.

IMPORTANTE:
- Si el texto está en primera persona ("me llamo", "trabajo en", etc.), reformula la información como si describieras al contacto en tercera persona
- Extrae solo información explícita del texto, no inventes datos
- Si algún campo no está presente en el texto, déjalo vacío o como null
- Para las notas, incluye cualquier información adicional relevante que no encaje en los otros campos
- Si el texto menciona contexto sobre cómo conociste a la persona, inclúyelo en las notas

Texto a analizar:
${transcript}`,
    });

    return result.object;
  } catch (error) {
    console.error("Error processing contact from transcript:", error);
    throw new Error(
      "No se pudo procesar la información del contacto. Por favor, inténtalo de nuevo."
    );
  }
}
