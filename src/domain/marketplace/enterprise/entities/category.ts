import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { Slug } from './value-objects/slug'

export interface CategoryProps {
  title: string
  slug: Slug
}

export class Category extends Entity<CategoryProps> {
  get title() {
    return this.props.title
  }

  get slug() {
    return this.props.slug
  }

  static create(props: Optional<CategoryProps, 'slug'>, id?: UniqueEntityID) {
    const category = new Category(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
      },
      id,
    )

    return category
  }
}
