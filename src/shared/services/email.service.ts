import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'

@Injectable()
export class EmailService {
  private readonly resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string }) {
    return this.resend.emails.send({
      from: 'Ecommerce <no-reply@khoaleshop.io.vn>',
      to: [`${payload.email}`],
      subject: 'Hello World',
      html: `<strong>${payload.code}</strong>`,
    })
  }
}
