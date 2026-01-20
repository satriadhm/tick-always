import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Aggregate stats by Type and Category
    const aggregation = await Transaction.aggregate([
      { $match: { userId: user.id } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              name: '$_id.category',
              total: '$totalAmount',
              count: '$count',
            },
          },
          totalTypeAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Initialize result structure
    const result = {
      income: { total: 0, categories: [] },
      expense: { total: 0, categories: [] },
      investment: { total: 0, categories: [] },
      trading: { total: 0, categories: [] },
    };

    // Populate result
    aggregation.forEach((group) => {
      const type = group._id as keyof typeof result;
      if (result[type]) {
        result[type].total = group.totalTypeAmount;
        result[type].categories = group.categories.sort((a: any, b: any) => b.total - a.total);
      }
    });

    // Calculate Net Balance (Sisa)
    // Assuming Sisa = Income - (Expense + Investment + Trading)
    // Note: Trading/Investment are outflows from "Cash" usually.
    const balance = result.income.total - (result.expense.total + result.investment.total + result.trading.total);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        balance,
      },
    });
  } catch (error) {
    console.error('Failed to fetch finance stats:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
