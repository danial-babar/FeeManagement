import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Student from '../../../models/Student';
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
      name,
      rollNumber,
      class: className,
      section,
      email,
      phone,
      status = 'active',
      guardian,
    } = req.body;

    // Check if roll number already exists
    const existingStudent = await Student.findOne({
      tenantId,
      rollNumber,
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    // Create student
    const student = await Student.create({
      tenantId,
      name,
      rollNumber,
      class: className,
      section,
      email,
      phone,
      status,
      guardian,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
} 