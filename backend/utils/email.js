const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (options) => {
  // Safe fallback if SMTP details are not configured yet
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL LOG]: To: ${options.to} | Subject: ${options.subject} | Body: ${options.text}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"LLC@FRCRCE" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT]: Successfully sent email to ${options.to}`);
  } catch (error) {
    console.error(`[EMAIL ERROR]: Failed to send email to ${options.to}:`, error.message);
  }
};

module.exports = sendEmail;
