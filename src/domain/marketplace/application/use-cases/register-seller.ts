import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { Seller } from '../../enterprise/entities/seller'
import { HashGenerator } from '../cryptography/hash-generator'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { SellerAlreadyExistsError } from './errors/seller-already-exists-error'

interface RegisterSellerUseCaseRequest {
  name: string
  phone: string
  email: string
  password: string
  avatarId: string
}

type RegisterSellerUseCaseResponse = Either<
  SellerAlreadyExistsError,
  {
    seller: Seller
  }
>

@Injectable()
export class RegisterSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private attachmentRepository: AttachmentsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
    avatarId,
    phone,
  }: RegisterSellerUseCaseRequest): Promise<RegisterSellerUseCaseResponse> {
    const [sellerWithSameEmailOrPhone, avatar] = await Promise.all([
      this.sellersRepository.findByEmailOrPhone({ email, phone }),
      this.attachmentRepository.findById(avatarId),
    ])

    if (sellerWithSameEmailOrPhone) {
      return left(new SellerAlreadyExistsError(`${email} - ${phone}`))
    }

    if (!avatar) {
      return left(new ResourceNotFoundError())
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const seller = Seller.create({
      name,
      email,
      password: hashedPassword,
      avatarId: avatar.id,
      phone,
    })

    await this.sellersRepository.create(seller)

    return right({
      seller,
    })
  }
}
