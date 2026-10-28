import { z } from "zod"

/** Google のサービスアカウント鍵 JSON のうち、トークン交換に使う項目。 */
export const ga4ServiceAccountSchema = z
  .object({
    client_email: z.email(),
    private_key: z.string().includes("PRIVATE KEY"),
    private_key_id: z.string().min(1),
  })
  .transform((value) => ({
    clientEmail: value.client_email,
    privateKey: value.private_key,
    privateKeyId: value.private_key_id,
  }))

export type Ga4ServiceAccount = z.infer<typeof ga4ServiceAccountSchema>
