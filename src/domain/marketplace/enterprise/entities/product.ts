import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { Category } from './category'
import { ProductAttachmentList } from './product-attachment-list'
import { Seller } from './seller'

export enum ProductStatus {
  available = 'available',
  cancelled = 'cancelled',
  sold = 'sold',
}

export interface ProductProps {
  title: string
  description: string
  status: ProductStatus
  priceInCents: number
  categoryId: UniqueEntityID
  ownerId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null

  attachments: ProductAttachmentList
  category: Category
  owner: Seller | null
}

export class Product extends AggregateRoot<ProductProps> {
  get title() {
    return this.props.title
  }

  get description() {
    return this.props.description
  }

  get status() {
    return this.props.status
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  get categoryId() {
    return this.props.categoryId
  }

  get ownerId() {
    return this.props.ownerId
  }

  get attachments() {
    return this.props.attachments
  }

  get category() {
    return this.props.category
  }

  get owner() {
    return this.props.owner
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set attachments(attachments: ProductAttachmentList) {
    this.props.attachments = attachments

    this.touch()
  }

  static create(
    props: Optional<
      ProductProps,
      'categoryId' | 'owner' | 'createdAt' | 'attachments'
    >,
    id?: UniqueEntityID,
  ) {
    const product = new Product(
      {
        ...props,
        category: props.category,
        categoryId: props.category.id,
        owner: props.owner ?? null,
        createdAt: props.createdAt ?? new Date(),
        attachments: new ProductAttachmentList(),
      },
      id,
    )

    return product
  }
}
