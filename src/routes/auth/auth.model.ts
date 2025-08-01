import { UserStatus } from 'src/shared/constants/auth.constant'
import { z } from 'zod'

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

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(20),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: [confirmPassword],
      })
    }
  })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type RegisterResType = z.infer<typeof RegisterResSchema>
