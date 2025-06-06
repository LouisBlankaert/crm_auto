import { NextRequest, NextResponse } from 'next/server';
import { getAllSellers } from '@/lib/actions/db-actions';

export async function GET() {
  try {
    const sellers = await getAllSellers();
    return NextResponse.json({ success: true, sellers }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des vendeurs:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des vendeurs' },
      { status: 500 }
    );
  }
}
