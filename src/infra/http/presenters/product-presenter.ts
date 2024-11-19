import { Product } from '@/domain/marketplace/enterprise/entities/product'

import { AttachmentPresenter } from './attachment-presenter'
import { CategoryPresenter } from './category-presenter'
import { SellerPresenter } from './seller-presenter'

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: product.owner ? SellerPresenter.toHTTP(product.owner) : null,
      category: product.category
        ? CategoryPresenter.toHTTP(product.category)
        : null,
      attachments: product.attachments
        .getItems()
        .map(AttachmentPresenter.toHTTP),
    }
  }
}
