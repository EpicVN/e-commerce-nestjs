import { ConflictException, Injectable } from '@nestjs/common'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { RegisterBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { RolesService } from './roles.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly AuthRepository: AuthRepository,
    private readonly rolesService: RolesService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      return await this.AuthRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email đã tồn tại')
      }

      throw error
    }
  }

  // async login(body: any) {
  //   try {
  //     const user = await this.PrismaService.user.findUnique({
  //       where: {
  //         email: body.email,
  //       },
  //     })

  //     if (!user) {
  //       throw new UnauthorizedException('Tài khoản không tồn tại!')
  //     }

  //     const isPasswordMatch = await this.hashingService.compare(body.password, user.password)

  //     if (!isPasswordMatch) {
  //       throw new UnprocessableEntityException([
  //         {
  //           field: 'password',
  //           error: 'Password is incorrect',
  //         },
  //       ])
  //     }

  //     const tokens = await this.generateTokens({ userId: user.id })

  //     return tokens
  //   } catch (error) {
  //     console.log(error)
  //     throw error
  //   }
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ])

  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

  //   await this.PrismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       expireAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   })

  //   return { accessToken, refreshToken }
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // 1. Kiểm tra refreshToken có hợp lệ
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

  //     // 2. Kiểm tra refreshToken có tồn tại trong db ko
  //     await this.PrismaService.refreshToken.findUniqueOrThrow({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })

  //     // 3. Xóa refreshToken cũ
  //     await this.PrismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })

  //     // 4. Tạo mới accessToken và refreshToken
  //     return this.generateTokens({ userId })
  //   } catch (error) {
  //     // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
  //     // refresh token của họ đã bị đánh cắp
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }

  //     throw new UnauthorizedException()
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // 1. Kiểm tra refreshToken có hợp lệ
  //     await this.tokenService.verifyRefreshToken(refreshToken)

  //     // 2. Xóa refreshToken trong db
  //     await this.PrismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })

  //     return {
  //       message: 'Logout successfully!',
  //     }
  //   } catch (error) {
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }

  //     throw new UnauthorizedException()
  //   }
  // }
}
