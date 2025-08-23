import { HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms, { StringValue } from 'ms'
import envConfig from 'src/shared/config'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenCreatePayload } from 'src/shared/types/jwt.type'
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { RolesService } from './roles.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly rolesService: RolesService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: 'REGISTER',
      })

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP không hợp lệ',
            path: 'code',
          },
        ])
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP đã hết hạn',
            path: 'code',
          },
        ])
      }

      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã được đăng kí',
            field: 'email',
          },
        ])
      }

      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // Check if email exists
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })

    if (user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email đã được đăng kí',
          field: 'email',
        },
      ])
    }

    // Create OTP code
    const code = generateOTP()

    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    })

    // Send OTP code to email
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    })

    if (error) {
      throw new UnprocessableEntityException([
        {
          message: 'Gửi mã OTP thất bại',
          path: 'code',
        },
      ])
    }

    return {
      message: 'Gửi mã OTP thành công',
    }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    try {
      const user = await this.authRepository.findUniqueUserIncludeRole({
        email: body.email,
      })

      if (!user) {
        throw new UnprocessableEntityException([
          {
            message: 'Tài khoản không tồn tại!',
            path: 'email',
          },
        ])
      }

      const isPasswordMatch = await this.hashingService.compare(body.password, user.password)

      if (!isPasswordMatch) {
        throw new UnprocessableEntityException([
          {
            path: 'password',
            error: 'Mật khẩu không đúng',
          },
        ])
      }

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      })

      const tokens = await this.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })

      return tokens
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenCreatePayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])

    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })

    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Kiểm tra refreshToken có tồn tại trong db ko
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })

      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh Token đã được sử dụng')
      }

      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb

      // 3. Cập nhật device vói userAgent và ip mới
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      })

      // 4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 5. Tạo mới accessToken và refreshToken
      const $token = this.generateTokens({ userId, deviceId, roleId, roleName })

      const [, , token] = await Promise.all([$updateDevice, $deleteRefreshToken, $token])

      return token
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ
      await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Xóa refreshToken trong db
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 3. Cập nhập device đã logout
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      })

      return {
        message: 'Đăng xuất thành công',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh Token đã được sử dụng')
      }

      throw new UnauthorizedException()
    }
  }
}
