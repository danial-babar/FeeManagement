import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Payment from '../../../models/Payment';
import Student from '../../../models/Student';
import FeeStructure from '../../../models/FeeStructure';
import { generateReceiptPDF } from '../../../lib/pdf';
import { sendPaymentReceipt } from '../../../lib/email';
import { sendPaymentReceiptSMS } from '../../../lib/sms';
import { protect, authorize } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await protect(req, res, () => {});
    await authorize('accountant', 'campus_admin')(req, res, () => {});

    await dbConnect();

    const {
      studentId,
      feeStructureId,
      installmentId,
      amount,
      paymentMethod,
      transactionId,
      notes,
    } = req.body;

    // Get student and fee structure details
    const student = await Student.findById(studentId);
    const feeStructure = await FeeStructure.findById(feeStructureId);

    if (!student || !feeStructure) {
      return res.status(404).json({ message: 'Student or fee structure not found' });
    }

    // Find the specific installment
    const installment = feeStructure.installments.find(
      (inst: any) => inst._id.toString() === installmentId
    );

    if (!installment) {
      return res.status(404).json({ message: 'Installment not found' });
    }

    // Generate receipt
    const receiptUrl = await generateReceiptPDF({
      receiptNumber: `REC-${Date.now()}`,
      date: new Date(),
      studentName: student.name,
      rollNumber: student.rollNumber,
      className: student.class,
      amount,
      paymentMethod,
      transactionId,
      institutionName: 'Your Institution Name', // Get from tenant
      institutionAddress: 'Your Institution Address', // Get from tenant
    });

    // Create payment record
    const payment = await Payment.create({
      tenantId: student.tenantId,
      studentId,
      feeStructureId,
      installmentId,
      amount,
      paymentDate: new Date(),
      paymentMethod,
      transactionId,
      status: 'completed',
      receiptUrl,
      notes,
    });

    // Update installment status
    installment.status = 'paid';
    await feeStructure.save();

    // Send notifications
    if (student.email) {
      await sendPaymentReceipt(
        student.email,
        student.name,
        amount,
        `${process.env.NEXT_PUBLIC_APP_URL}${receiptUrl}`
      );
    }

    if (student.phone) {
      await sendPaymentReceiptSMS(
        student.phone,
        student.name,
        amount,
        `${process.env.NEXT_PUBLIC_APP_URL}${receiptUrl}`
      );
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 