import { NextRequest, NextResponse } from 'next/server';
import { createReminder, updateReminderStatus } from '@/lib/actions/db-actions';
import { ReminderStatus } from '@/lib/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation des données
    if (!data.date || !data.reason || !(data.sellerId || data.buyerId)) {
      return NextResponse.json(
        { error: 'Les champs date, motif et client sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Création du rappel
    const reminder = await createReminder(data);
    
    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du rappel:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du rappel' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation des données
    if (!data.id || !data.status) {
      return NextResponse.json(
        { error: 'L\'identifiant du rappel et le statut sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le statut est valide
    if (!Object.values(ReminderStatus).includes(data.status)) {
      return NextResponse.json(
        { error: 'Le statut fourni n\'est pas valide' },
        { status: 400 }
      );
    }
    
    // Mise à jour du statut du rappel
    const reminder = await updateReminderStatus(data.id, data.status);
    
    return NextResponse.json({ success: true, reminder }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rappel:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du rappel' },
      { status: 500 }
    );
  }
}
