import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '@/types';

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String, // Storing as string to match other references, though ObjectId is ideal if consistently used
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'investment', 'trading'],
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    description: {
      type: String,
    },
    frequency: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mongooseEncryption } = require('@/lib/plugins/mongooseEncryption');
TransactionSchema.plugin(mongooseEncryption, { fields: ['description'] });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
