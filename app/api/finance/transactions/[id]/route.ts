import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const user = await getCurrentUser(request);
    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    await connectDB();

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: user.id },
      updates,
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { transaction } });
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const id = (await params).id;
      const user = await getCurrentUser(request);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
  
      await connectDB();
  
      const transaction = await Transaction.findOneAndDelete({ _id: id, userId: user.id });
  
      if (!transaction) {
        return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, data: { message: 'Transaction deleted' } });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
  }
