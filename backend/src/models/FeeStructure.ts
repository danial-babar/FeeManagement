import mongoose from 'mongoose';

export interface IInstallment {
  label: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

export interface IFeeStructure {
  title: string;
  description?: string;
  totalAmount: number;
  academicYear: string;
  applicableClasses: string[];
  installments: IInstallment[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const installmentSchema = new mongoose.Schema<IInstallment>({
  label: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
});

const feeStructureSchema = new mongoose.Schema<IFeeStructure>({
  title: { type: String, required: true },
  description: String,
  totalAmount: { type: Number, required: true },
  academicYear: { type: String, required: true },
  applicableClasses: [{ type: String, required: true }],
  installments: [installmentSchema],
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFeeStructure>('FeeStructure', feeStructureSchema); 