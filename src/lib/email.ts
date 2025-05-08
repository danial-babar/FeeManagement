import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Fee Management System" <${process.env.SMTP_USER}>`,
      ...options,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPaymentReminder = async (email: string, studentName: string, amount: number, dueDate: Date) => {
  const subject = 'Payment Reminder';
  const text = `Dear ${studentName},\n\nThis is a reminder that your payment of ${amount} is due on ${dueDate.toLocaleDateString()}.\n\nPlease make the payment at your earliest convenience.\n\nBest regards,\nFee Management System`;

  return sendEmail({
    to: email,
    subject,
    text,
  });
};

export const sendPaymentReceipt = async (email: string, studentName: string, amount: number, receiptUrl: string) => {
  const subject = 'Payment Receipt';
  const text = `Dear ${studentName},\n\nThank you for your payment of ${amount}.\n\nYou can download your receipt from: ${receiptUrl}\n\nBest regards,\nFee Management System`;

  return sendEmail({
    to: email,
    subject,
    text,
  });
}; 