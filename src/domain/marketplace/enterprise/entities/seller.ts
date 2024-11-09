import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { Attachment } from './attachment'

export interface SellerProps {
  name: string
  email: string
  phone: string
  password: string
  avatarId: UniqueEntityID

  avatar: Attachment | null
}

export class Seller extends Entity<SellerProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get password() {
    return this.props.password
  }

  get avatarId() {
    return this.props.avatarId
  }

  get avatar() {
    return this.props.avatar
  }

  static create(props: Optional<SellerProps, 'avatar'>, id?: UniqueEntityID) {
    const seller = new Seller(
      {
        ...props,
        avatar: props.avatar ?? null,
      },
      id,
    )

    return seller
  }
}
