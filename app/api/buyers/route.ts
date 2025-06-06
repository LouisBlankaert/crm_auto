import { NextRequest, NextResponse } from 'next/server';
import { createBuyer } from '@/lib/actions/db-actions';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation des données
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json(
        { error: 'Les champs prénom, nom, email et téléphone sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Création de l'acheteur
    const buyer = await createBuyer(data);
    
    return NextResponse.json({ success: true, buyer }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'acheteur:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'acheteur' },
      { status: 500 }
    );
  }
}
