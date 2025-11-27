// Quick test to verify email service is working
import nodemailer from 'nodemailer';

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'kitchensathii@gmail.com',
      pass: 'xceb cvkt wkbp twai',
    },
  });

  try {
    // Verify connection
    console.log('📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'KitchenSathi <kitchensathii@gmail.com>',
      to: 'riyarajawat212@gmail.com',
      subject: '🧪 Test Email from KitchenSathi',
      html: '<h1>Success!</h1><p>If you received this, the email service is working! 🎉</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();

