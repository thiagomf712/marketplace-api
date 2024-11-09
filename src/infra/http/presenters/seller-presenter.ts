import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

import { AttachmentPresenter } from './attachment-presenter'

export class SellerPresenter {
  static toHTTP(seller: Seller) {
    return {
      id: seller.id.toString(),
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      avatar: seller.avatar ? AttachmentPresenter.toHTTP(seller.avatar) : null,
    }
  }
}
