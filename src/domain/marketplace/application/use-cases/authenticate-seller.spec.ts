import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeSeller } from 'test/factories/make-seller'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { AuthenticateSellerUseCase } from './authenticate-seller'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemorySellersRepository: InMemorySellersRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateSellerUseCase

describe('Authenticate Seller', () => {
  beforeEach(() => {
    inMemorySellersRepository = new InMemorySellersRepository()

    fakeHasher = new FakeHasher()

    encrypter = new FakeEncrypter()

    sut = new AuthenticateSellerUseCase(
      inMemorySellersRepository,
      fakeHasher,
      encrypter,
    )
  })

  it('should be able to authenticate a seller', async () => {
    inMemorySellersRepository.items.push(
      makeSeller({
        email: 'johndoe@example.com',
        password: await fakeHasher.hash('123456'),
      }),
    )

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)

    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should not be able to authenticate with seller does not exists', async () => {
    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    inMemorySellersRepository.items.push(
      makeSeller({
        email: 'johndoe@example.com',
        password: await fakeHasher.hash('654321'),
      }),
    )

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
