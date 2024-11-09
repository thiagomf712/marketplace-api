import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { SellerAlreadyExistsError } from './errors/seller-already-exists-error'
import { RegisterSellerUseCase } from './register-seller'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeHasher: FakeHasher
let sut: RegisterSellerUseCase

describe('Register Seller', () => {
  beforeEach(() => {
    inMemorySellersRepository = new InMemorySellersRepository()

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    fakeHasher = new FakeHasher()

    sut = new RegisterSellerUseCase(
      inMemorySellersRepository,
      inMemoryAttachmentsRepository,
      fakeHasher,
    )
  })

  it('should be able to register a new seller', async () => {
    const avatar = makeAttachment({ url: 'avatar-url' })

    inMemoryAttachmentsRepository.items.push(avatar)

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      avatarId: avatar.id.toString(),
      password: '123456',
    })

    expect(result.isRight()).toBe(true)

    expect(result.value).toEqual({
      seller: inMemorySellersRepository.items[0],
    })
  })

  it('should hash seller password upon registration', async () => {
    const avatar = makeAttachment({ url: 'avatar-url' })

    inMemoryAttachmentsRepository.items.push(avatar)

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      avatarId: avatar.id.toString(),
      password: '123456',
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)

    expect(inMemorySellersRepository.items[0].password).toEqual(hashedPassword)
  })

  it('should not be able to register a seller with phone or email already in use', async () => {
    const avatar = makeAttachment({ url: 'avatar-url' })

    inMemoryAttachmentsRepository.items.push(avatar)

    inMemorySellersRepository.items.push(
      makeSeller({
        email: 'johndoe@example.com',
        phone: '123456789',
      }),
    )

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      avatarId: avatar.id.toString(),
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(SellerAlreadyExistsError)
  })

  it('should not be able to register a seller that avatar is not found', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      avatarId: 'invalid-avatar-id',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
