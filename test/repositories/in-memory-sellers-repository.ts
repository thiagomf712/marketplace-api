import {
  FindSellerByEmailOrPhoneParams,
  SellersRepository,
} from '@/domain/marketplace/application/repositories/sellers-repository'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

export class InMemorySellersRepository implements SellersRepository {
  public items: Seller[] = []

  async findByEmail(email: string): Promise<Seller | null> {
    const seller = this.items.find((item) => item.email === email)

    if (!seller) {
      return null
    }

    return seller
  }

  async findByEmailOrPhone(
    params: FindSellerByEmailOrPhoneParams,
  ): Promise<Seller | null> {
    const seller = this.items.find(
      (item) => item.email === params.email || item.phone === params.phone,
    )

    if (!seller) {
      return null
    }

    return seller
  }

  async create(seller: Seller) {
    this.items.push(seller)
  }
}
