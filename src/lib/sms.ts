import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to: string, message: string) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log('SMS sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

export const sendPaymentReminderSMS = async (
  phone: string,
  studentName: string,
  amount: number,
  dueDate: Date
) => {
  const message = `Dear ${studentName}, your payment of ${amount} is due on ${dueDate.toLocaleDateString()}. Please make the payment at your earliest convenience.`;

  return sendSMS(phone, message);
};

export const sendPaymentReceiptSMS = async (
  phone: string,
  studentName: string,
  amount: number,
  receiptUrl: string
) => {
  const message = `Dear ${studentName}, thank you for your payment of ${amount}. You can download your receipt from: ${receiptUrl}`;

  return sendSMS(phone, message);
}; 