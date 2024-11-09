import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { SellerAlreadyExistsError } from '@/domain/marketplace/application/use-cases/errors/seller-already-exists-error'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { Public } from '@/infra/auth/public'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { SellerPresenter } from '../presenters/seller-presenter'

const createSellerBodySchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    avatarId: z.string().uuid(),
    password: z.string(),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
  })

const createSellerBodyPipe = new ZodValidationPipe(createSellerBodySchema)

type CreateSellerBodySchema = z.infer<typeof createSellerBodySchema>

@Public()
@Controller('/sellers')
export class CreateSellerController {
  constructor(private registerSeller: RegisterSellerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(createSellerBodyPipe) body: CreateSellerBodySchema) {
    const { name, email, password, avatarId, phone } = body

    const result = await this.registerSeller.execute({
      name,
      email,
      password,
      avatarId,
      phone,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case SellerAlreadyExistsError:
          throw new ConflictException(error.message)

        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      seller: SellerPresenter.toHTTP(result.value.seller),
    }
  }
}
