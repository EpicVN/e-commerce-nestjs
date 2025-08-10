import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import OTPEmail from 'emails/otp'
import React from 'react'

// const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), {
//   encoding: 'utf-8',
// })

@Injectable()
export class EmailService {
  private readonly resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP'
    // const companyName = 'Khoa Le Shop'
    // const address = 'TP.HCM, Việt Nam'

    return this.resend.emails.send({
      from: 'Ecommerce <no-reply@khoaleshop.io.vn>',
      to: [`${payload.email}`],
      subject: 'Email OTP',
      react: <OTPEmail code={payload.code} title={subject}/>,
      // html: otpTemplate
      //   .replaceAll('{{subject}}', subject)
      //   .replaceAll('{{companyName}}', companyName)
      //   .replaceAll('{{address}}', address)
      //   .replaceAll('{{code}}', payload.code),
    })
  }
}
