import { Injectable } from '@nestjs/common'

import { Either, right } from '@/core/either'

import { Product, ProductStatus } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'

interface FetchProductsRecentUseCaseRequest {
  page: number
  status?: ProductStatus
  search?: string
}

type FetchProductsRecentUseCaseResponse = Either<
  null,
  {
    products: Product[]
  }
>

@Injectable()
export class FetchProductsRecentUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    page,
    search,
    status,
  }: FetchProductsRecentUseCaseRequest): Promise<FetchProductsRecentUseCaseResponse> {
    const products = await this.productsRepository.findManyRecent({
      page,
      search,
      status,
    })

    return right({
      products,
    })
  }
}
