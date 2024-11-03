import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface SellerProps {
  name: string
  email: string
  phone: string
  password: string
  avatarId: string
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

  static create(props: SellerProps, id?: UniqueEntityID) {
    const seller = new Seller(props, id)

    return seller
  }
}
