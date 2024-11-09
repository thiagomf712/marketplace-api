import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Res,
} from '@nestjs/common'
import { type Response } from 'express'
import { z } from 'zod'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { WrongCredentialsError } from '@/domain/marketplace/application/use-cases/errors/wrong-credentials-error'
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
    private authenticateSeller: AuthenticateSellerUseCase,
    private envService: EnvService,
  ) {}

  @Post()
  async handle(
    @Body(authenticateBodyPipe) body: AuthenticateBodySchema,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body

    const result = await this.authenticateSeller.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new ForbiddenException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

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
