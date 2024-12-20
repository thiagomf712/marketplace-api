import { Seller } from '../../enterprise/entities/seller'

export interface FindSellerByEmailOrPhoneParams {
  email: string
  phone: string
}

export abstract class SellersRepository {
  abstract findByEmailOrPhone(
    params: FindSellerByEmailOrPhoneParams,
  ): Promise<Seller | null>

  abstract findById(id: string): Promise<Seller | null>

  abstract findByEmail(email: string): Promise<Seller | null>

  abstract create(seller: Seller): Promise<void>
}
