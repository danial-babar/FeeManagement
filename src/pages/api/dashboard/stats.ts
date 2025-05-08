import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Student from '../../../models/Student';
import Payment from '../../../models/Payment';
import FeeStructure from '../../../models/FeeStructure';
import { protect, authorize } from '../../../middleware/auth';

interface MonthlyPayment {
  _id: {
    year: number;
    month: number;
  };
  total: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await protect(req, res, () => {});
    await authorize('accountant', 'campus_admin', 'viewer')(req, res, () => {});

    await dbConnect();

    const { tenantId } = (req as any).user;

    // Get total students
    const totalStudents = await Student.countDocuments({
      tenantId,
      status: 'active',
    });

    // Get total payments
    const payments = await Payment.find({
      tenantId,
      status: 'completed',
    });

    const totalPayments = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

    // Get total due
    const students = await Student.find({
      tenantId,
      status: 'active',
    });

    let totalDue = 0;
    const defaulters = new Set();

    for (const student of students) {
      const feeStructures = await FeeStructure.find({
        tenantId,
        applicableClasses: student.class,
      });

      for (const feeStructure of feeStructures) {
        for (const installment of feeStructure.installments) {
          const payment = await Payment.findOne({
            tenantId,
            studentId: student._id,
            feeStructureId: feeStructure._id,
            installmentId: installment._id,
            status: 'completed',
          });

          if (!payment) {
            const dueDate = new Date(installment.dueDate);
            const today = new Date();
            const daysDiff = Math.floor(
              (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff > 30) {
              totalDue += installment.amount;
              defaulters.add(student._id.toString());
            }
          }
        }
      }
    }

    // Get payment trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPayments = await Payment.aggregate<MonthlyPayment>([
      {
        $match: {
          tenantId,
          status: 'completed',
          paymentDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const paymentTrends = {
      labels: monthlyPayments.map(
        (payment: MonthlyPayment) =>
          `${new Date(2000, payment._id.month - 1).toLocaleString('default', {
            month: 'short',
          })} ${payment._id.year}`
      ),
      data: monthlyPayments.map((payment: MonthlyPayment) => payment.total),
    };

    res.status(200).json({
      totalStudents,
      totalPayments,
      totalDue,
      defaultersCount: defaulters.size,
      paymentTrends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 