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
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
