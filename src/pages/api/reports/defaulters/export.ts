import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/db';
import Student from '../../../../models/Student';
import FeeStructure from '../../../../models/FeeStructure';
import Payment from '../../../../models/Payment';
import { protect, authorize } from '../../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await protect(req, res, () => {});
    await authorize('accountant', 'campus_admin')(req, res, () => {});

    await dbConnect();

    const { tenantId } = (req as any).user;
    const { daysOverdue = 30, class: className = '' } = req.query;

    // Get all active students
    const students = await Student.find({
      tenantId,
      status: 'active',
      ...(className && { class: className }),
    });

    const defaulters = [];

    for (const student of students) {
      // Get all fee structures for the student's class
      const feeStructures = await FeeStructure.find({
        tenantId,
        applicableClasses: student.class,
      });

      const overdueInstallments = [];
      let totalDue = 0;

      for (const feeStructure of feeStructures) {
        for (const installment of feeStructure.installments) {
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
                feeStructure: feeStructure.title,
                installment: installment.label,
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
          studentName: student.name,
          rollNumber: student.rollNumber,
          className: student.class,
          totalDue,
          overdueInstallments,
        });
      }
    }

    // Generate CSV content
    const csvContent = [
      [
        'Student Name',
        'Roll Number',
        'Class',
        'Total Due',
        'Fee Structure',
        'Installment',
        'Amount',
        'Due Date',
        'Days Overdue',
      ].join(','),
      ...defaulters.flatMap((defaulter) =>
        defaulter.overdueInstallments.map((installment) =>
          [
            defaulter.studentName,
            defaulter.rollNumber,
            defaulter.className,
            defaulter.totalDue,
            installment.feeStructure,
            installment.installment,
            installment.amount,
            installment.dueDate.toISOString().split('T')[0],
            installment.daysOverdue,
          ].join(',')
        )
      ),
    ].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=defaulters-report-${new Date().toISOString().split('T')[0]}.csv`
    );

    res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 