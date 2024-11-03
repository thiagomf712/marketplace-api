import { Body, Controller, Post, Res } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'crypto'
import { type Response } from 'express'
import { z } from 'zod'

import { Public } from '@/infra/auth/public'
import { EnvService } from '@/infra/env/env.service'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const authenticateBodyPipe = new ZodValidationPipe(authenticateBodySchema)

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Public()
@Controller('sellers/sessions')
export class AuthenticateController {
  constructor(
    private jwtService: JwtService,
    private envService: EnvService,
  ) {}

  @Post()
  async handle(
    @Body(authenticateBodyPipe) body: AuthenticateBodySchema,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body

    const accessToken = await this.jwtService.signAsync({
      sub: randomUUID(),
    })

    const expiresInSeconds = this.envService.get('JWT_EXPIRES_IN_SECONDS')

    response.cookie('access-token', accessToken, {
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * expiresInSeconds),
    })

    return {
      accessToken,
    }
  }
}
