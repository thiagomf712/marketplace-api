import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { FakeUploader } from 'test/storage/fake-uploader'

import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'
import { UploadAttachmentUseCase } from './upload-attachments'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader
let sut: UploadAttachmentUseCase

describe('Upload and create attachment', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    fakeUploader = new FakeUploader()

    sut = new UploadAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should be able to upload attachments', async () => {
    const result = await sut.execute({
      attachments: [
        {
          fileName: 'profile.png',
          fileType: 'image/png',
          body: Buffer.from(''),
        },
        {
          fileName: 'profile2.jpg',
          fileType: 'image/jpeg',
          body: Buffer.from(''),
        },
      ],
    })

    expect(result.isRight()).toBe(true)

    expect(result.value).toEqual({
      attachments: expect.arrayContaining([
        inMemoryAttachmentsRepository.items[0],
        inMemoryAttachmentsRepository.items[1],
      ]),
    })

    expect(fakeUploader.uploads).toHaveLength(2)

    expect(fakeUploader.uploads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fileName: 'profile.png',
        }),
        expect.objectContaining({
          fileName: 'profile2.jpg',
        }),
      ]),
    )
  })

  it('should not be able to upload an attachment with invalid file type', async () => {
    const result = await sut.execute({
      attachments: [
        {
          fileName: 'profile.mp3',
          fileType: 'audio/mpeg',
          body: Buffer.from(''),
        },
      ],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })
})
