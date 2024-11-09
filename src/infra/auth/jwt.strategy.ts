import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { type Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'

import { EnvService } from '../env/env.service'

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  private static extractJwtFromCookie(request: Request) {
    const cookieKey = 'access-token'

    if (
      request.cookies &&
      cookieKey in request.cookies &&
      typeof request.cookies[cookieKey] === 'string' &&
      request.cookies[cookieKey].length > 0
    ) {
      return request.cookies[cookieKey]
    }

    return null
  }

  async validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}
