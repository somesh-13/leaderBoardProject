import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
})

export interface WelcomeEmailData {
  to: string
  name: string
  verificationUrl?: string
}

export async function sendWelcomeEmail({ to, name, verificationUrl }: WelcomeEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Wall Street Bets!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚀 Welcome to Wall Street Bets!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Hello ${name}!</h2>
          
          <p>Welcome to the ultimate trading competition platform! You've successfully joined our community of traders.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #333;">🎯 What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Complete your profile setup</li>
              <li>Join the leaderboard competition</li>
              <li>Start building your portfolio</li>
              <li>Connect with other traders</li>
            </ul>
          </div>
          
          ${verificationUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verify Your Email
            </a>
          </div>
          ` : ''}
          
          <p style="margin-top: 30px;">Ready to compete? <a href="${process.env.NEXTAUTH_URL}/leaderboard" style="color: #667eea;">Check out the leaderboard</a> and start your trading journey!</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `

  const textContent = `
Welcome to Wall Street Bets!

Hello ${name}!

Welcome to the ultimate trading competition platform! You've successfully joined our community of traders.

What's Next?
- Complete your profile setup
- Join the leaderboard competition  
- Start building your portfolio
- Connect with other traders

${verificationUrl ? `Verify your email: ${verificationUrl}` : ''}

Ready to compete? Visit ${process.env.NEXTAUTH_URL}/leaderboard to check out the leaderboard and start your trading journey!

If you didn't create this account, please ignore this email.
  `

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@wallstreetbets.com',
      to,
      subject: '🚀 Welcome to Wall Street Bets - Let\'s Start Trading!',
      text: textContent,
      html: htmlContent,
    })

    console.log(`Welcome email sent successfully to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail({ to, name, verificationUrl }: WelcomeEmailData & { verificationUrl: string }) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - Wall Street Bets</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📧 Verify Your Email</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Hello ${name}!</h2>
          
          <p>Please verify your email address to complete your registration and start trading on Wall Street Bets.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This verification link will expire in 24 hours.</p>
          
          <p style="color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@wallstreetbets.com',
      to,
      subject: 'Verify Your Email - Wall Street Bets',
      html: htmlContent,
    })

    console.log(`Verification email sent successfully to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}