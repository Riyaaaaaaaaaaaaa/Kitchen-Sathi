import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.EMAIL_PORT || '587');
      const emailSecure = process.env.EMAIL_SECURE === 'true';
      const emailUser = process.env.EMAIL_USER;
      const emailPassword = process.env.EMAIL_PASSWORD;

      if (!emailUser || !emailPassword) {
        console.warn('⚠️  [EmailService] Email credentials not configured. Email sending will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      console.log('✅ [EmailService] Initialized successfully');
    } catch (error) {
      console.error('❌ [EmailService] Failed to initialize:', error);
    }
  }

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ [EmailService] Transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@kitchensathi.com';

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      });

      console.log(`✅ [EmailService] Email sent successfully to ${to}: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ [EmailService] Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  // Send verification email with code
  async sendVerificationEmail(email: string, code: string, name?: string): Promise<boolean> {
    const userName = name || 'there';
    const subject = '🔐 Verify Your KitchenSathi Account';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🍳 KitchenSathi</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Your Smart Kitchen Companion</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome, ${userName}! 👋</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for signing up for KitchenSathi! We're excited to help you manage your kitchen, reduce waste, and discover amazing recipes.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To complete your registration, please verify your email address using the code below:
              </p>
              
              <!-- Verification Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; display: inline-block;">
                      <p style="margin: 0 0 10px; color: #78350f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Verification Code</p>
                      <p style="margin: 0; color: #ea580c; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ⏱️ This code will expire in <strong>10 minutes</strong> for your security.
              </p>
              
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't create an account with KitchenSathi, you can safely ignore this email.
              </p>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
              
              <!-- Features Preview -->
              <h3 style="margin: 0 0 20px; color: #1f2937; font-size: 18px; font-weight: 600;">What you can do with KitchenSathi:</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="30" valign="top" style="padding: 0 0 15px;">
                    <span style="font-size: 24px;">📦</span>
                  </td>
                  <td valign="top" style="padding: 0 0 15px;">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                      <strong>Smart Grocery Management</strong> - Track your groceries, expiry dates, and reduce food waste
                    </p>
                  </td>
                </tr>
                <tr>
                  <td width="30" valign="top" style="padding: 0 0 15px;">
                    <span style="font-size: 24px;">🍽️</span>
                  </td>
                  <td valign="top" style="padding: 0 0 15px;">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                      <strong>AI Meal Planning</strong> - Get personalized meal suggestions based on your groceries
                    </p>
                  </td>
                </tr>
                <tr>
                  <td width="30" valign="top" style="padding: 0 0 15px;">
                    <span style="font-size: 24px;">📊</span>
                  </td>
                  <td valign="top" style="padding: 0 0 15px;">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                      <strong>Kitchen Analytics</strong> - Track your savings and see your impact on reducing waste
                    </p>
                  </td>
                </tr>
                <tr>
                  <td width="30" valign="top">
                    <span style="font-size: 24px;">👨‍🍳</span>
                  </td>
                  <td valign="top">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                      <strong>Recipe Collection</strong> - Create, save, and share your favorite recipes
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Happy Cooking! 🎉
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} KitchenSathi. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Send password reset email with code
  async sendPasswordResetEmail(email: string, code: string, name?: string): Promise<boolean> {
    const userName = name || 'there';
    const subject = '🔑 Reset Your KitchenSathi Password';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🍳 KitchenSathi</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi ${userName},</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your KitchenSathi account.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Use the verification code below to reset your password:
              </p>
              
              <!-- Reset Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; display: inline-block;">
                      <p style="margin: 0 0 10px; color: #78350f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Reset Code</p>
                      <p style="margin: 0; color: #ea580c; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ⏱️ This code will expire in <strong>10 minutes</strong> for your security.
              </p>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 0 0 30px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
              
              <!-- Security Tips -->
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600;">🔒 Password Security Tips:</h3>
              
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                <li>Use a strong, unique password (at least 8 characters)</li>
                <li>Include uppercase, lowercase, numbers, and symbols</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Need help? Contact us at kitchensathii@gmail.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} KitchenSathi. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Send expiry alert email
  async sendExpiryAlert(
    to: string,
    userName: string,
    itemName: string,
    expiryDate: Date,
    daysUntilExpiry: number
  ): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    const expiryDateStr = expiryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const urgencyLevel = daysUntilExpiry <= 1 ? 'urgent' : daysUntilExpiry <= 2 ? 'warning' : 'info';
    const urgencyColor = urgencyLevel === 'urgent' ? '#dc2626' : urgencyLevel === 'warning' ? '#f59e0b' : '#3b82f6';
    const urgencyEmoji = urgencyLevel === 'urgent' ? '🚨' : urgencyLevel === 'warning' ? '⚠️' : '📅';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      ${urgencyEmoji} Grocery Expiry Alert
                    </h1>
                    <p style="margin: 10px 0 0; color: #fed7aa; font-size: 16px;">
                      KitchenSathi - Smart Kitchen Management
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                      Hi <strong>${userName}</strong>,
                    </p>
                    
                    <div style="background-color: ${urgencyLevel === 'urgent' ? '#fee2e2' : urgencyLevel === 'warning' ? '#fef3c7' : '#dbeafe'}; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 0 0 30px; border-radius: 8px;">
                      <p style="margin: 0 0 10px; color: #1f2937; font-size: 18px; font-weight: 600;">
                        "${itemName}" is expiring ${daysUntilExpiry === 0 ? 'today' : daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`}!
                      </p>
                      <p style="margin: 0; color: #4b5563; font-size: 14px;">
                        📅 Expiry Date: <strong>${expiryDateStr}</strong>
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Don't let your groceries go to waste! Here are some suggestions:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="padding: 0 0 15px;">
                          <span style="font-size: 20px;">🍽️</span>
                        </td>
                        <td valign="top" style="padding: 0 0 15px;">
                          <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                            <strong>Use it in a meal</strong> - Check your meal planner for recipe ideas
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="30" valign="top" style="padding: 0 0 15px;">
                          <span style="font-size: 20px;">❄️</span>
                        </td>
                        <td valign="top" style="padding: 0 0 15px;">
                          <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                            <strong>Freeze it</strong> - Extend its life by storing it in the freezer
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="30" valign="top">
                          <span style="font-size: 20px;">🤝</span>
                        </td>
                        <td valign="top">
                          <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                            <strong>Share with neighbors</strong> - Help reduce food waste in your community
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/grocery-list" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);">
                            View Grocery List
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                      You're receiving this because you have expiry alerts enabled in your KitchenSathi preferences.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} KitchenSathi. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `${urgencyEmoji} Expiry Alert: ${itemName} expires ${daysUntilExpiry === 0 ? 'today' : daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`}`,
      html,
    });

    console.log(`✅ [EmailService] Expiry alert sent to ${to} for ${itemName}`);
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ [EmailService] Transporter not initialized.');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ [EmailService] Connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ [EmailService] Connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

