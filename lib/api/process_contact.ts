import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import Constants from "expo-constants";
import { z } from "zod";

// Schema para la información del contacto extraída
// Todos los contextos son textos descriptivos en lenguaje natural (string | null)
// Referencia: database.types.ts -> contacts.Row
const ContactInfoSchema = z.object({
  first_name: z
    .string()
    .min(1)
    .describe("El nombre del contacto (obligatorio)"),
  last_name: z
    .string()
    .nullable()
    .optional()
    .describe(
      "El apellido del contacto (opcional). Si no se menciona, devuelve null o string vacío, NUNCA uses 'Unknown' ni valores por defecto"
    ),
  professional_context: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Contexto profesional: un texto descriptivo en lenguaje natural sobre la situación profesional del contacto. Ejemplo: 'Está trabajando en Tech Corp como ingeniero de software en el departamento de desarrollo'. Si no hay información profesional, devuelve null."
    ),
  personal_context: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Contexto personal: un texto descriptivo en lenguaje natural sobre información personal del contacto. Ejemplo: 'Vive en Madrid y cumple años el 15 de marzo'. Si no hay información personal, devuelve null."
    ),
  relationship_context: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Contexto de relación: un texto descriptivo en lenguaje natural sobre cómo conociste a la persona o el contexto de vuestra relación. Ejemplo: 'Lo conocí en una conferencia de tecnología el año pasado'. Si no hay contexto de relación, devuelve null."
    ),
  details: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Detalles adicionales: un texto descriptivo en lenguaje natural con notas generales o información adicional sobre el contacto. Ejemplo: 'Es muy amigable, le gusta el fútbol y tiene dos hijos'. Si no hay detalles, devuelve null."
    ),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// Get OpenAI API key from environment variables
const getOpenAIApiKey = () => {
  const keyFromEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const keyFromConstants = Constants.expoConfig?.extra?.openaiApiKey;
  const apiKey = keyFromEnv || keyFromConstants;

  if (apiKey) {
    return apiKey.trim();
  }

  console.error(
    "OpenAI API key not found. Set EXPO_PUBLIC_OPENAI_API_KEY in .env and restart with 'npx expo start -c'"
  );
  return null;
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
      "OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file and restart the server with 'npx expo start -c'."
    );
  }

  // Verificar que la clave tenga el formato correcto antes de usarla
  if (apiKey.length < 20) {
    throw new Error(
      `La API key parece ser demasiado corta (${apiKey.length} caracteres). Verifica que copiaste la clave completa.`
    );
  }

  const openai = createOpenAI({
    apiKey,
  });

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ContactInfoSchema,
      prompt: `Analiza el siguiente texto sobre un contacto y extrae toda la información relevante organizándola en contextos descriptivos en lenguaje natural.

INSTRUCCIONES:

1. **first_name**: Es OBLIGATORIO. Extrae el nombre del contacto. Si no se menciona explícitamente, usa un valor razonable basado en el contexto o "Unknown"/"Sin nombre" como último recurso.

2. **last_name**: Es OPCIONAL. Extrae el apellido del contacto SOLO si se menciona explícitamente en el texto. Si NO se menciona el apellido, devuelve null o una cadena vacía. NUNCA uses "Unknown", "Sin apellido" ni ningún otro valor por defecto para el apellido.

3. **professional_context**: Crea un texto descriptivo en lenguaje natural sobre la situación profesional del contacto. Incluye empresa, puesto, departamento si se mencionan. 
   - Ejemplo: "Está trabajando en Tech Corp como ingeniero de software en el departamento de desarrollo"
   - Ejemplo: "Trabaja como diseñador gráfico freelance"
   - Si no hay información profesional, devuelve null

4. **personal_context**: Crea un texto descriptivo en lenguaje natural sobre información personal del contacto (dirección, cumpleaños, etc.).
   - Ejemplo: "Vive en Madrid, en la calle Gran Vía 123, y cumple años el 15 de marzo"
   - Ejemplo: "Reside en Barcelona y su cumpleaños es en diciembre"
   - Si no hay información personal, devuelve null

5. **relationship_context**: Crea un texto descriptivo sobre cómo conociste a la persona o el contexto de vuestra relación.
   - Ejemplo: "Lo conocí en una conferencia de tecnología en Madrid el año pasado"
   - Ejemplo: "Es amigo de un amigo, nos presentaron en una fiesta"
   - Si no hay contexto de relación, devuelve null

6. **details**: Crea un texto descriptivo con notas generales o información adicional sobre el contacto.
   - Ejemplo: "Es muy amigable y profesional, le gusta el fútbol y tiene dos hijos"
   - Ejemplo: "Le interesa la tecnología y la fotografía"
   - Si no hay detalles adicionales, devuelve null

FORMATO DE RESPUESTA:
- Todos los contextos deben ser strings (texto descriptivo) o null
- NO uses objetos ni estructuras complejas
- Los textos deben ser frases completas y naturales en español

EJEMPLO DE RESPUESTA CON APELLIDO:
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "professional_context": "Está trabajando en Tech Corp como ingeniero de software en el departamento de desarrollo de productos",
  "personal_context": "Vive en Madrid, en el barrio de Chamberí, y cumple años el 15 de marzo de 1990",
  "relationship_context": "Lo conocí en una conferencia de tecnología en Madrid el año pasado, nos sentamos juntos en una charla sobre React",
  "details": "Es muy amigable y profesional, le gusta el fútbol y tiene dos hijos. Siempre está dispuesto a ayudar con temas técnicos"
}

EJEMPLO DE RESPUESTA SIN APELLIDO:
{
  "first_name": "María",
  "last_name": null,
  "professional_context": "Trabaja como diseñadora gráfica freelance",
  "personal_context": null,
  "relationship_context": "La conocí en un evento de networking",
  "details": null
}

Texto a analizar:
${transcript}

Responde ÚNICAMENTE con el objeto JSON, sin comentarios adicionales.`,
    });

    return result.object;
  } catch (error: any) {
    // Manejo específico de errores de schema
    if (
      error?.message?.includes("No object generated") ||
      error?.message?.includes("did not match schema") ||
      error?.message?.includes("schema")
    ) {
      throw new Error(
        "El formato de la respuesta no es válido. Por favor, intenta describir el contacto de manera más clara o inténtalo de nuevo."
      );
    }

    // Manejo específico de errores de API
    if (
      error?.message?.includes("API key") ||
      error?.message?.includes("Incorrect API key")
    ) {
      throw new Error(
        "La clave de API de OpenAI no es válida. Verifica tu EXPO_PUBLIC_OPENAI_API_KEY en el archivo .env"
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

    // Error genérico
    console.error("Error processing contact:", error?.message || error);
    throw new Error(
      error?.message ||
        "No se pudo procesar la información del contacto. Por favor, inténtalo de nuevo."
    );
  }
}
