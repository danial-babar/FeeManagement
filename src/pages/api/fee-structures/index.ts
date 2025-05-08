import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import FeeStructure from '../../../models/FeeStructure';
import { protect, authorize } from '../../../middleware/auth';

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
    const {
      page = 1,
      limit = 10,
      search = '',
      academicYear = '',
      class: className = '',
    } = req.query;

    const query: any = { tenantId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    if (className) {
      query.applicableClasses = className;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [feeStructures, total] = await Promise.all([
      FeeStructure.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      FeeStructure.countDocuments(query),
    ]);

    res.status(200).json({
      feeStructures,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 