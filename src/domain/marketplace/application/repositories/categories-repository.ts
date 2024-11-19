import { Category } from '../../enterprise/entities/category'

export abstract class CategoriesRepository {
  abstract findMany(): Promise<Category[]>

  abstract findById(id: string): Promise<Category | null>
}
