import cron from 'node-cron';
import dbConnect from './db';
import Student from '../models/Student';
import FeeStructure from '../models/FeeStructure';
import Payment from '../models/Payment';
import { sendPaymentReminder } from './email';
import { sendPaymentReminderSMS } from './sms';

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    await dbConnect();

    // Get all active students
    const students = await Student.find({ status: 'active' });

    for (const student of students) {
      // Get all fee structures for the student's class
      const feeStructures = await FeeStructure.find({
        tenantId: student.tenantId,
        applicableClasses: student.class,
      });

      for (const feeStructure of feeStructures) {
        for (const installment of feeStructure.installments) {
          // Check if payment exists for this installment
          const payment = await Payment.findOne({
            tenantId: student.tenantId,
            studentId: student._id,
            feeStructureId: feeStructure._id,
            installmentId: installment._id,
            status: 'completed',
          });

          if (!payment) {
            const dueDate = new Date(installment.dueDate);
            const today = new Date();
            const daysDiff = Math.floor(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Send reminders 7 days before due date and on due date
            if (daysDiff === 7 || daysDiff === 0) {
              if (student.email) {
                await sendPaymentReminder(
                  student.email,
                  student.name,
                  installment.amount,
                  dueDate
                );
              }

              if (student.phone) {
                await sendPaymentReminderSMS(
                  student.phone,
                  student.name,
                  installment.amount,
                  dueDate
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in payment reminder scheduler:', error);
  }
}); 