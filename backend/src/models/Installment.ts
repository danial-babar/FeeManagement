import mongoose from 'mongoose';

export interface IInstallment {
  feeStructureId: string;
  label: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const installmentSchema = new mongoose.Schema<IInstallment>({
  feeStructureId: { type: String, required: true },
  label: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  },
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IInstallment>('Installment', installmentSchema); 