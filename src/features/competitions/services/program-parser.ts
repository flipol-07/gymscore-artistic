import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import pdf from 'pdf-parse-fork'

export const ProgramSchema = z.object({
  sessions: z.array(z.object({
    name: z.string(),
    order: z.number(),
    promotions: z.array(z.object({
      name: z.string(),
      gender: z.enum(['male', 'female']),
      gymnasts: z.array(z.object({
        fullName: z.string(),
        clubName: z.string(),
        apparatusStartingOrder: z.array(z.string())
      }))
    }))
  }))
})

export type ParsedProgram = z.infer<typeof ProgramSchema>

export async function parseProgramFromBase64(base64Pdf: string): Promise<ParsedProgram> {
  // 1. Convert Base64 to Buffer
  const buffer = Buffer.from(base64Pdf, 'base64')

  // 2. Extract Text
  let extractedText = ''
  try {
    const pdfData = await pdf(buffer)
    extractedText = pdfData.text
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('No se pudo extraer el texto del PDF. Intenta con un PDF digital.')
  }

  // 3. Send Text to GPT-4o
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: ProgramSchema,
    messages: [
      {
        role: 'system',
        content: `Eres un experto en arbitraje y gestión de competiciones de gimnasia artística. 
        Tu tarea es transformar el texto de un "Programa de Competición" (extraído de PDF) en una estructura de datos JSON perfecta.

        Sigue estas reglas de CLASIFICACIÓN INTELIGENTE:
        1. JERARQUÍA: Identifica primero las JORNADAS (grandes bloques de tiempo como "Sábado Mañana", "Jornada 1").
        2. CATEGORÍAS/PROMOCIONES: Dentro de cada jornada, busca los grupos competitivos. Los nombres suelen ser compuestos: [Nivel] + [Categoría] + [Género] (ej: Base 2 Infantil Femenino).
        3. SUBGRUPOS: Si una categoría tiene muchos gimnastas (más de 12-15), a menudo se dividen en subgrupos o "Rotaciones". Agrúpalos bajo la misma categoría pero respeta el orden.
        4. GÉNERO: Si no se especifica explícitamente en cada línea, infiérelo del contexto de la categoría (ej: "Vía Olímpica GAF" es femenino, "GAM" es masculino).
        5. ORDEN DE PASO: Si ves secuencias de aparatos (Salto, Paralelas, Barra, Suelo), asócialas a los gimnastas como su 'apparatusStartingOrder'.

        REGLA DE ORO: Si el texto es confuso, prioriza mantener a los gimnastas del mismo club juntos si parecen estar en el mismo bloque horario.`
      },
      {
        role: 'user',
        content: `Texto extraído del programa:\n\n${extractedText}\n\nAnaliza y clasifica siguiendo las reglas anteriores.`
      }
    ]
  })

  return object
}
