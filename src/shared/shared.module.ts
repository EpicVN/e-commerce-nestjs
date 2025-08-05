import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { SharedUserRepository } from './repositories/shared-user.repo'

const sharedServices = [PrismaService, HashingService, TokenService, SharedUserRepository]

@Global()
@Module({
  providers: [...sharedServices],
  exports: sharedServices,
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
})
export class SharedModule {}
