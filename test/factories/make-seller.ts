import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Seller,
  SellerProps,
} from '@/domain/marketplace/enterprise/entities/seller'

import { makeAttachment } from './make-attachment'

export function makeSeller(
  override: Partial<SellerProps> = {},
  id?: UniqueEntityID,
) {
  const seller = Seller.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password(),
      avatarId: override.avatar?.id ?? new UniqueEntityID(faker.string.uuid()),
      avatar: makeAttachment(override.avatar ?? undefined, override.avatar?.id),
      ...override,
    },
    id,
  )

  return seller
}
