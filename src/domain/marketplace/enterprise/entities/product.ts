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

  set title(title: string) {
    this.props.title = title

    this.touch()
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description

    this.touch()
  }

  get status() {
    return this.props.status
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  set priceInCents(priceInCents: number) {
    this.props.priceInCents = priceInCents

    this.touch()
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

  set attachments(attachments: ProductAttachmentList) {
    this.props.attachments = attachments

    this.touch()
  }

  get category() {
    return this.props.category
  }

  set category(category: Category) {
    this.props.category = category

    this.props.categoryId = category.id

    this.touch()
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
        attachments: props.attachments ?? new ProductAttachmentList(),
      },
      id,
    )

    return product
  }
}
