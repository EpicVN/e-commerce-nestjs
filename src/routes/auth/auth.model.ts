import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

// Register schema
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(20),
    code: z.string().length(6),
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

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

// Verification code schema
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum(TypeOfVerificationCode),
  expiresAt: z.date(),
  createdAt: z.date(),
})

// Send OTP schema
export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

// Login schema
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

// Refresh token schema
export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string(),
})

export const RefreshTokenResSchema = LoginResSchema

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
})

// Device schema
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number().positive(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean().default(true),
})

// Role schema
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Logout schema
export const LogoutBodySchema = RefreshTokenBodySchema

// Exported types
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

export type LoginResType = z.infer<typeof LoginResSchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = LoginResType
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>

export type DeviceType = z.infer<typeof DeviceSchema>

export type RoleType = z.infer<typeof RoleSchema>

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>
