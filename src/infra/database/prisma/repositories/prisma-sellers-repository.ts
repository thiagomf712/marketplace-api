import { Injectable } from '@nestjs/common'

import {
  FindSellerByEmailOrPhoneParams,
  SellersRepository,
} from '@/domain/marketplace/application/repositories/sellers-repository'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

import { PrismaSellerMapper } from '../mappers/prisma-seller-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaSellersRepository implements SellersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findFirst({
      where: {
        id,
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerMapper.toDomain(seller)
  }

  async findByEmail(email: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerMapper.toDomain(seller)
  }

  async findByEmailOrPhone(
    params: FindSellerByEmailOrPhoneParams,
  ): Promise<Seller | null> {
    const seller = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            phone: params.phone,
          },
          {
            email: params.email,
          },
        ],
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerMapper.toDomain(seller)
  }

  async create(seller: Seller): Promise<void> {
    const data = PrismaSellerMapper.toPrisma(seller)

    await this.prisma.user.create({
      data,
    })
  }
}
