import { z } from 'zod'

export const envSchema = z.object({
  CORS_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .optional()
    .default(60 * 60 * 24 * 7 /* 7 dias */),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  PORT: z.coerce.number().optional().default(3333),
})

export type Env = z.infer<typeof envSchema>
