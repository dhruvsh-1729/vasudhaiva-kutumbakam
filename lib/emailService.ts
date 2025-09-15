// lib/emailService.ts
import { apiInstance } from './brevo';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class EmailService {
  private static instance: EmailService;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = 'vk4.ki.oar@gmail.com';
    this.fromName = 'VK Competition';
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    toEmail: string, 
    userName: string, 
    verificationToken: string
  ): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;
      
      const template = this.getVerificationEmailTemplate(userName, verificationUrl);
      
      const sendSmtpEmail = {
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: toEmail, name: userName }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      };

      const response:any = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Verification email sent successfully:', response.body.messageId);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    toEmail: string, 
    userName: string, 
    resetToken: string
  ): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
      
      const template = this.getPasswordResetEmailTemplate(userName, resetUrl);
      
      const sendSmtpEmail = {
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: toEmail, name: userName }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      };

      const response:any = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Password reset email sent successfully:', response.messageId);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(toEmail: string, userName: string): Promise<boolean> {
    try {
      const template = this.getWelcomeEmailTemplate(userName);
      
      const sendSmtpEmail = {
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: toEmail, name: userName }],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      };

      const response:any = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Welcome email sent successfully:', response.messageId);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Email verification template
   */
  private getVerificationEmailTemplate(userName: string, verificationUrl: string): EmailTemplate {
    return {
      subject: 'Verify Your Email - VK Competition | Vasudhaiva Kutumbakam',
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - VK Competition</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Welcome to</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 16px; font-weight: 300;">Vasudhaiva Kutumbakam</p>
              </div>

              <!-- Content -->
              <div style="padding: 50px 30px;">
                <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
                  Welcome to the Universal Family, ${userName}!
                </h2>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
                  Thank you for joining our global community celebrating unity through creative expression. 
                  To complete your registration and start your journey, please verify your email address.
                </p>

                <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                  <p style="color: #991b1b; margin-bottom: 20px; font-size: 14px; font-weight: 500;">
                    Click the button below to verify your email:
                  </p>
                  <a href="${verificationUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;">
                    Verify My Email
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                  If you cannot click the button above, copy and paste this link into your browser:
                </p>
                <p style="color: #dc2626; word-break: break-all; font-size: 13px; background: #f9fafb; padding: 10px; border-radius: 4px; border-left: 4px solid #dc2626;">
                  ${verificationUrl}
                </p>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.4; margin: 0;">
                    <strong>Note:</strong> This verification link will expire in 24 hours for security purposes.
                    If you didn't create an account with VK Competition, please ignore this email.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px;">
                  This email was sent by VK Competition - Vasudhaiva Kutumbakam
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 0; font-style: italic;">
                  "The World is One Family"
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      textContent: `
        Welcome to VK Competition - Vasudhaiva Kutumbakam!

        Hi ${userName},

        Thank you for joining our global community celebrating unity through creative expression. 
        To complete your registration, please verify your email address by visiting:

        ${verificationUrl}

        This verification link will expire in 24 hours.

        If you didn't create an account with VK Competition, please ignore this email.

        Best regards,
        VK Competition Team
        "The World is One Family"
      `
    };
  }

  /**
   * Password reset email template
   */
  private getPasswordResetEmailTemplate(userName: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Reset Your Password - VK Competition',
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - VK Competition</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
              </div>

              <!-- Content -->
              <div style="padding: 50px 30px;">
                <h2 style="color: #dc2626; font-size: 22px; margin-bottom: 20px; font-weight: 600;">
                  Hello ${userName},
                </h2>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
                  We received a request to reset the password for your VK Competition account. 
                  If you made this request, click the button below to set a new password.
                </p>

                <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                    Reset My Password
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                  If you cannot click the button above, copy and paste this link into your browser:
                </p>
                <p style="color: #dc2626; word-break: break-all; font-size: 13px; background: #f9fafb; padding: 10px; border-radius: 4px; border-left: 4px solid #dc2626;">
                  ${resetUrl}
                </p>

                <div style="border: 1px solid #fbbf24; background: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h3 style="color: #92400e; margin: 0 0 10px; font-size: 16px;">⚠️ Security Notice:</h3>
                  <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.4;">
                    This password reset link will expire in 1 hour. If you didn't request this reset, 
                    please ignore this email and your password will remain unchanged.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px;">
                  This email was sent by VK Competition - Vasudhaiva Kutumbakam
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 0; font-style: italic;">
                  "The World is One Family"
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      textContent: `
        Password Reset Request - VK Competition

        Hello ${userName},

        We received a request to reset the password for your VK Competition account.
        To reset your password, visit: ${resetUrl}

        This link will expire in 1 hour for security purposes.

        If you didn't request this reset, please ignore this email.

        Best regards,
        VK Competition Team
      `
    };
  }

  /**
   * Welcome email template
   */
  private getWelcomeEmailTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Welcome to VK Competition! Your Journey Begins 🎨',
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to VK Competition</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">🎉 Welcome to the Family!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 16px;">Vasudhaiva Kutumbakam</p>
              </div>

              <!-- Content -->
              <div style="padding: 50px 30px;">
                <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
                  Congratulations, ${userName}! 🌟
                </h2>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
                  Your email has been successfully verified! You're now part of a global community 
                  that celebrates unity through creative expression.
                </p>

                <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 30px 0;">
                  <h3 style="color: #15803d; margin: 0 0 15px; font-size: 18px;">What's Next?</h3>
                  <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Explore competition categories</li>
                    <li>Submit your creative expressions</li>
                    <li>Connect with artists worldwide</li>
                    <li>Celebrate unity through diversity</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/main" 
                     style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                    Start Your Journey
                  </a>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
                  <p style="color: #dc2626; font-size: 16px; font-style: italic; margin: 0;">
                    "वसुधैव कुटुम्बकम् - The World is One Family"
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px;">
                  Thank you for joining VK Competition
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                  Together, we celebrate unity through creative expression
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      textContent: `
        Welcome to VK Competition! 

        Congratulations, ${userName}!

        Your email has been successfully verified! You're now part of a global community 
        that celebrates unity through creative expression.

        What's Next?
        - Explore competition categories
        - Submit your creative expressions  
        - Connect with artists worldwide
        - Celebrate unity through diversity

        Start your journey: ${process.env.NEXT_PUBLIC_BASE_URL}/main

        "वसुधैव कुटुम्बकम् - The World is One Family"

        Thank you for joining VK Competition!
      `
    };
  }
}