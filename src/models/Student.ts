import mongoose, { Document, Model } from 'mongoose';

interface IStudent extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  rollNumber: string;
  email?: string;
  phone?: string;
  class: string;
  section?: string;
  admissionDate: Date;
  status: 'active' | 'inactive' | 'graduated';
  guardian: {
    name?: string;
    relation?: string;
    phone?: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new mongoose.Schema<IStudent>({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide student name'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  rollNumber: {
    type: String,
    required: [true, 'Please provide roll number'],
    unique: true,
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
  },
  class: {
    type: String,
    required: [true, 'Please provide class'],
  },
  section: String,
  admissionDate: {
    type: Date,
    required: [true, 'Please provide admission date'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active',
  },
  guardian: {
    name: String,
    relation: String,
    phone: String,
    email: String,
  },
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
StudentSchema.pre('save', function(this: IStudent, next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models.Student as Model<IStudent>) || mongoose.model<IStudent>('Student', StudentSchema); 