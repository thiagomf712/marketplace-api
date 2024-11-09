import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { type Response } from 'express'

@Controller('sign-out')
export class SignOutController {
  @HttpCode(HttpStatus.OK)
  @Post()
  async handle(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access-token')
  }
}
