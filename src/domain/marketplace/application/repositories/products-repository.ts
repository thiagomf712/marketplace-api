import { Product } from '../../enterprise/entities/product'

export abstract class ProductsRepository {
  abstract findById(id: string): Promise<Product | null>

  abstract create(product: Product): Promise<void>

  abstract save(product: Product): Promise<void>
}
