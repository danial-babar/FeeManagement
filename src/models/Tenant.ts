import mongoose, { Document, Model } from 'mongoose';

interface ITenant extends Document {
  name: string;
  domain: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact: {
    email?: string;
    phone?: string;
  };
  settings: {
    currency: string;
    language: 'en' | 'ur';
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new mongoose.Schema<ITenant>({
  name: {
    type: String,
    required: [true, 'Please provide a name for the institution'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  domain: {
    type: String,
    required: [true, 'Please provide a domain'],
    unique: true,
    maxlength: [100, 'Domain cannot be more than 100 characters'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  contact: {
    email: String,
    phone: String,
  },
  settings: {
    currency: {
      type: String,
      default: 'PKR',
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'ur'],
    },
    timezone: {
      type: String,
      default: 'Asia/Karachi',
    },
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
TenantSchema.pre('save', function(this: ITenant, next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models.Tenant as Model<ITenant>) || mongoose.model<ITenant>('Tenant', TenantSchema); 