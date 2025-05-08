import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import Student from '../models/Student';
import FeeStructure from '../models/FeeStructure';
import Payment from '../models/Payment';
import Installment from '../models/Installment';

const router = Router();

router.get('/stats', protect, authorize('accountant', 'campus_admin', 'viewer'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const tenantId = req.user.tenantId;

    const [
      totalStudents,
      totalFeeStructures,
      totalPayments,
      totalRevenue,
      pendingPayments,
      defaulters
    ] = await Promise.all([
      Student.countDocuments({ tenantId, status: 'active' }),
      FeeStructure.countDocuments({ tenantId }),
      Payment.countDocuments({ tenantId }),
      Payment.aggregate([
        { $match: { tenantId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Installment.countDocuments({ tenantId, status: 'pending' }),
      Installment.countDocuments({ 
        tenantId, 
        status: 'pending',
        dueDate: { $lt: new Date() }
      })
    ]);

    res.json({
      totalStudents,
      totalFeeStructures,
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments,
      defaulters
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 