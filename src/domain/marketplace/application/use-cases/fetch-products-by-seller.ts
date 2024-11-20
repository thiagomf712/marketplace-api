import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { Product, ProductStatus } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'

interface FetchProductsBySellerUseCaseRequest {
  sellerId: string
  status?: ProductStatus
  search?: string
}

type FetchProductsBySellerUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    products: Product[]
  }
>

@Injectable()
export class FetchProductsBySellerUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
  ) {}

  async execute({
    sellerId,
    search,
    status,
  }: FetchProductsBySellerUseCaseRequest): Promise<FetchProductsBySellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError())
    }

    const products = await this.productsRepository.findManyBySeller({
      sellerId,
      search,
      status,
    })

    return right({
      products,
    })
  }
}
