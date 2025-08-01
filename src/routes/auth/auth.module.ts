import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';
import { TokenService } from 'src/shared/services/token.service';
import { AuthRepository } from './auth.repo';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, TokenService, AuthRepository]
})
export class AuthModule {}
