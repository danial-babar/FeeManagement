import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Student from '../../../models/Student';
import FeeStructure from '../../../models/FeeStructure';
import Payment from '../../../models/Payment';
import { protect, authorize } from '../../../middleware/auth';

interface Defaulter {
  studentId: string;
  name: string;
  rollNumber: string;
  className: string;
  totalDue: number;
  overdueInstallments: {
    feeStructureId: string;
    installmentId: string;
    amount: number;
    dueDate: Date;
    daysOverdue: number;
  }[];
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
    const { daysOverdue = 30 } = req.query;

    // Get all active students
    const students = await Student.find({
      tenantId,
      status: 'active',
    });

    const defaulters: Defaulter[] = [];

    for (const student of students) {
      // Get all fee structures for the student's class
      const feeStructures = await FeeStructure.find({
        tenantId,
        applicableClasses: student.class,
      });

      const overdueInstallments: Defaulter['overdueInstallments'] = [];
      let totalDue = 0;

      for (const feeStructure of feeStructures) {
        for (const installment of feeStructures.installments) {
          // Check if payment exists for this installment
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

            if (daysDiff > Number(daysOverdue)) {
              overdueInstallments.push({
                feeStructureId: feeStructure._id.toString(),
                installmentId: installment._id.toString(),
                amount: installment.amount,
                dueDate,
                daysOverdue: daysDiff,
              });
              totalDue += installment.amount;
            }
          }
        }
      }

      if (overdueInstallments.length > 0) {
        defaulters.push({
          studentId: student._id.toString(),
          name: student.name,
          rollNumber: student.rollNumber,
          className: student.class,
          totalDue,
          overdueInstallments,
        });
      }
    }

    res.status(200).json({
      count: defaulters.length,
      totalDue: defaulters.reduce((sum, defaulter) => sum + defaulter.totalDue, 0),
      defaulters,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 