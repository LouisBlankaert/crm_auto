import { NextRequest, NextResponse } from 'next/server';
import { getAllBuyers } from '@/lib/actions/db-actions';

export async function GET() {
  try {
    const buyers = await getAllBuyers();
    return NextResponse.json({ success: true, buyers }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des acheteurs:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des acheteurs' },
      { status: 500 }
    );
  }
}
