import { CategoriesRepository } from '@/domain/marketplace/application/repositories/categories-repository'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

export class InMemoryCategoriesRepository extends CategoriesRepository {
  public items: Category[] = []

  async findMany(): Promise<Category[]> {
    return this.items
  }

  async findById(id: string): Promise<Category | null> {
    return this.items.find((category) => category.id.toString() === id) ?? null
  }
}
