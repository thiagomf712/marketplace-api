import { ProductsRepository } from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  async findById(id: string): Promise<Product | null> {
    return this.items.find((product) => product.id.toString() === id) ?? null
  }

  async create(product: Product) {
    this.items.push(product)
  }

  async save(product: Product): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(product.id))

    this.items[index] = product
  }
}
