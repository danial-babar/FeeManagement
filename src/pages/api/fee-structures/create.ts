import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import FeeStructure from '../../../models/FeeStructure';
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

    const { tenantId } = (req as any).user;
    const {
      title,
      description,
      totalAmount,
      academicYear,
      applicableClasses,
      installments,
    } = req.body;

    // Validate total amount matches sum of installments
    const installmentsSum = installments.reduce(
      (sum: number, installment: any) => sum + installment.amount,
      0
    );

    if (installmentsSum !== totalAmount) {
      return res.status(400).json({
        message: 'Total amount must match sum of installments',
      });
    }

    // Create fee structure
    const feeStructure = await FeeStructure.create({
      tenantId,
      title,
      description,
      totalAmount,
      academicYear,
      applicableClasses,
      installments: installments.map((installment: any) => ({
        ...installment,
        status: 'pending',
      })),
    });

    res.status(201).json(feeStructure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 