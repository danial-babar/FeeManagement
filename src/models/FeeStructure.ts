import mongoose, { Document, Model } from 'mongoose';

interface IInstallment {
  label: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

interface IFeeStructure extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  totalAmount: number;
  installments: IInstallment[];
  academicYear: string;
  applicableClasses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Please provide installment label'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide installment amount'],
    min: [0, 'Amount cannot be negative'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date'],
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
});

const FeeStructureSchema = new mongoose.Schema<IFeeStructure>({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide fee structure title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: String,
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: [0, 'Amount cannot be negative'],
  },
  installments: [InstallmentSchema],
  academicYear: {
    type: String,
    required: [true, 'Please provide academic year'],
  },
  applicableClasses: [{
    type: String,
    required: [true, 'Please provide applicable classes'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
FeeStructureSchema.pre('save', function(this: IFeeStructure, next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models.FeeStructure as Model<IFeeStructure>) || mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema); 