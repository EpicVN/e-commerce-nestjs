import React, { CSSProperties } from 'react'
import { Body, Container, Head, Heading, Html, Img, Section, Text } from '@react-email/components'
import { title } from 'process'

interface OTPEmailProps {
  code?: string
  title?: string
}

const logoUrl = `https://img.freepik.com/free-vector/flat-design-mobile-store-logo-template_23-2149728779.jpg?t=st=1754814511~exp=1754818111~hmac=5b301058e142cdc6cbf83168c1f4317ba75986b39a95f5fd076a13172f6e5251&w=1480`

export const OTPEmail = ({ code }: OTPEmailProps) => (
  <Html>
    <Head title={title} />
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} width="212" height="88" alt="Logo" style={logo} />
        <Text style={tertiary}>Mã xác thực OTP</Text>
        <Heading style={secondary}>Hãy nhập mã xác thực OTP để xác minh danh tính của bạn.</Heading>
        <Section style={codeContainer}>
          <Text style={codeStyle}>{code}</Text>
        </Section>
        <Text style={paragraph}>Nếu bạn không phải là người thực hiện hành động trên, xin hãy bỏ qua email này.</Text>
      </Container>
      <Text style={footer}>From Khoa Le's Shop with ❤️.</Text>
    </Body>
  </Html>
)

OTPEmail.PreviewProps = {
  code: '144833',
} as OTPEmailProps

export default OTPEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
}

const logo: CSSProperties = {
  margin: '0 auto',
  display: 'block',
  width: '120px',
  height: 'auto',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  objectFit: 'contain',
}

const tertiary = {
  color: '#0a85ea',
  fontSize: '12px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '32px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
}

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
}

const codeStyle = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
}

// const link = {
//   color: "#444",
//   textDecoration: "underline",
// };

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
}
