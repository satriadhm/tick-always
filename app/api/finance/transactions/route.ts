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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const transactions = await Transaction.find({ userId: user.id })
      .sort({ date: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: { transactions } });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount, category, date, description } = await request.json();

    if (!type || !amount || !category || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const transaction = await Transaction.create({
      userId: user.id,
      type,
      amount,
      category,
      date,
      description,
    });

    return NextResponse.json({ success: true, data: { transaction } });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
