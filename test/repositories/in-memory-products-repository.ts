import {
  FindManyProductsBySellerParams,
  FindManyProductsRecentParams,
  ProductsRepository,
} from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  async findManyRecent(
    params: FindManyProductsRecentParams,
  ): Promise<Product[]> {
    return this.items
      .filter((product) => {
        let isValid = true

        if (params.status) {
          isValid &&= product.status === params.status
        }

        if (params.search) {
          isValid &&=
            product.description.includes(params.search) ||
            product.title.includes(params.search)
        }

        return isValid
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((params.page - 1) * 20, params.page * 20)
  }

  async findManyBySeller(
    params: FindManyProductsBySellerParams,
  ): Promise<Product[]> {
    return this.items.filter((product) => {
      let isValid = true

      isValid &&= product.ownerId.toString() === params.sellerId

      if (params.status) {
        isValid &&= product.status === params.status
      }

      if (params.search) {
        isValid &&=
          product.description.includes(params.search) ||
          product.title.includes(params.search)
      }

      return isValid
    })
  }

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
