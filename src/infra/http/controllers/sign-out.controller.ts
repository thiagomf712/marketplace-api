import { Controller, Post, Res } from '@nestjs/common'
import { type Response } from 'express'

@Controller('sign-out')
export class SignOutController {
  @Post()
  async handle(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access-token')
  }
}
