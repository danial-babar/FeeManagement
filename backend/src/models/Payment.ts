import mongoose from 'mongoose';

export interface IPayment {
  studentId: string;
  feeStructureId: string;
  installmentId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  transactionId?: string;
  notes?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>({
  studentId: { type: String, required: true },
  feeStructureId: { type: String, required: true },
  installmentId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'cheque', 'online'],
    required: true 
  },
  transactionId: String,
  notes: String,
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPayment>('Payment', paymentSchema); 