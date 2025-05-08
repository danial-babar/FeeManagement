import mongoose from 'mongoose';

export interface IStudent {
  name: string;
  rollNumber: string;
  class: string;
  section?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new mongoose.Schema<IStudent>({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  section: String,
  email: String,
  phone: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IStudent>('Student', studentSchema); 