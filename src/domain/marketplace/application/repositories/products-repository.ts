import { Product, ProductStatus } from '../../enterprise/entities/product'

export interface FindManyProductsRecentParams {
  search?: string
  page: number
  status?: ProductStatus
}

export interface FindManyProductsBySellerParams {
  search?: string
  sellerId: string
  status?: ProductStatus
}

export abstract class ProductsRepository {
  abstract findManyRecent(
    params: FindManyProductsRecentParams,
  ): Promise<Product[]>

  abstract findManyBySeller(
    params: FindManyProductsBySellerParams,
  ): Promise<Product[]>

  abstract findById(id: string): Promise<Product | null>

  abstract create(product: Product): Promise<void>

  abstract save(product: Product): Promise<void>
}
