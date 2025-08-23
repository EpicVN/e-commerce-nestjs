import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthType, ConditionGuard } from '../constants/auth.constant'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'
import { APIKeyGuard } from './api-key.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } }

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])

    const errors: any[] = []

    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const guard of guards) {
        try {
          if (await Promise.resolve(guard.canActivate(context))) {
            return true
          }
        } catch (err) {
          errors.push(err)
        }
      }

      throw errors[0] || new UnauthorizedException()
    } else {
      for (const guard of guards) {
        try {
          const result = await Promise.resolve(guard.canActivate(context))
          if (!result) throw new UnauthorizedException()
        } catch (err) {
          throw err instanceof UnauthorizedException ? err : new UnauthorizedException(err?.message)
        }
      }

      return true
    }
  }
}
