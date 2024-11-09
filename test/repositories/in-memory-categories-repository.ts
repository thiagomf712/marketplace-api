import { CategoriesRepository } from '@/domain/marketplace/application/repositories/categories-repository'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

export class InMemoryCategoriesRepository extends CategoriesRepository {
  public items: Category[] = []

  async findMany(): Promise<Category[]> {
    return this.items
  }
}
