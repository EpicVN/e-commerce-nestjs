import { z } from 'zod'
import { UserStatus } from 'src/shared/constants/auth.constant'

export const UserSchema = z
  .object({
    id: z.number(),
    email: z.email(),
    name: z.string().min(1).max(50),
    password: z.string().min(6).max(20),
    phoneNumber: z.string().min(9).max(15),
    avatar: z.string().nullable(),
    totpSecret: z.string().nullable(),
    status: z.enum(UserStatus),
    roleId: z.number().positive(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict()

export type UserType = z.infer<typeof UserSchema>