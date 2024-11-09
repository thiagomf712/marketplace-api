import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  async findById(id: string): Promise<Attachment | null> {
    return (
      this.items.find((attachment) => attachment.id.toString() === id) ?? null
    )
  }

  async create(attachment: Attachment) {
    this.items.push(attachment)
  }
}
