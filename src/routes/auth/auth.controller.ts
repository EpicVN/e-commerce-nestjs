import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { RegisterBodyDTO, RegisterResDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ZodSerializerDto(RegisterResDTO)
  @Post('register')
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  // @Post('login')
  // async login(@Body() body: any) {
  //   return await this.authService.login(body)
  // }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Body() body: any) {
  //   return await this.authService.refreshToken(body.refreshToken)
  // }

  // @Post('logout')
  // async logout(@Body() body: any) {
  //   return await this.authService.logout(body.refreshToken)
  // }
}
