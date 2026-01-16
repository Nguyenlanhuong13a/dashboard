import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// Lazy-init Resend to avoid build errors when API key is not set
let resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

// Gmail SMTP transporter (created lazily)
function getGmailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendWithGmail(email: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const transporter = getGmailTransporter()
  if (!transporter) {
    return { success: false, error: 'Gmail not configured' }
  }

  try {
    await transporter.sendMail({
      from: `RealEstate Pro <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    })
    console.log('Email sent via Gmail to:', email)
    return { success: true }
  } catch (err) {
    console.error('Gmail send error:', err)
    return { success: false, error: 'Failed to send email via Gmail' }
  }
}

async function sendWithResend(email: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const client = getResend()
  if (!client) return { success: false, error: 'Resend API key not configured' }

  try {
    const fromDomain = process.env.RESEND_DOMAIN || 'resend.dev'
    const { error } = await client.emails.send({
      from: `RealEstate Pro <noreply@${fromDomain}>`,
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Resend send error:', err)
    return { success: false, error: 'Failed to send email via Resend' }
  }
}

export async function sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const subject = 'Verify your email - RealEstate Pro'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0;">Verify your email</h1>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 24px; text-align: center;">
          Enter this code to complete your registration:
        </p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">${code}</span>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This code expires in 10 minutes. If you didn't request this, ignore this email.
        </p>
      </div>
    </body>
    </html>
  `

  // Try Gmail first if configured
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const gmailResult = await sendWithGmail(email, subject, html)
    if (gmailResult.success) {
      return gmailResult
    }
    console.log('Gmail failed, trying Resend...')
  }

  // Try Resend with verified domain
  if (process.env.RESEND_DOMAIN) {
    const resendResult = await sendWithResend(email, subject, html)
    if (resendResult.success) {
      return resendResult
    }
  }

  return { success: false, error: 'Email service not configured. Please set GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_DOMAIN.' }
}

export async function sendTeamInviteEmail(
  email: string,
  teamName: string,
  inviterName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/teams/join?token=${token}`
  const subject = `You're invited to join ${teamName} - RealEstate Pro`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0;">Team Invitation</h1>
        </div>

        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
          <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on RealEstate Pro.
        </p>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          Click the button below to accept the invitation and join the team.
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${inviteUrl}" style="display: inline-block; background: #0F766E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
            Accept Invitation
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-bottom: 16px;">
          Or copy this link: <br>
          <span style="color: #6b7280; word-break: break-all;">${inviteUrl}</span>
        </p>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This invitation expires in 7 days. If you didn't expect this email, you can ignore it.
        </p>
      </div>
    </body>
    </html>
  `

  // Try Gmail first if configured
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const gmailResult = await sendWithGmail(email, subject, html)
    if (gmailResult.success) {
      return gmailResult
    }
  }

  // Try Resend
  if (process.env.RESEND_DOMAIN) {
    return await sendWithResend(email, subject, html)
  }

  return { success: false, error: 'Email service not configured' }
}
