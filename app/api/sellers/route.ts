import { NextRequest, NextResponse } from 'next/server';
import { createSeller } from '@/lib/actions/db-actions';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Les informations du vendeur sont optionnelles

    // Validation stricte du véhicule
    if (!data.vehicle) {
      return NextResponse.json(
        { error: 'Les informations du véhicule sont requises' },
        { status: 400 }
      );
    }

    // Validation du véhicule si présent
    if (data.vehicle) {
      if (!data.vehicle.make || !data.vehicle.model || !data.vehicle.mileage) {
        return NextResponse.json(
          { error: 'Les informations du véhicule sont incomplètes (make, model, mileage requis)' },
          { status: 400 }
        );
      }
      // Vérification de doublon dans la base Prisma
      if (
        (data.vehicle.adId && data.vehicle.adId.trim() !== "") ||
        (data.vehicle.sourceUrl && data.vehicle.sourceUrl.trim() !== "")
      ) {
        let existing = null;
        const orConditions = [];
        if (data.vehicle.adId && data.vehicle.adId.trim() !== "") {
          orConditions.push({ adId: data.vehicle.adId });
        }
        if (data.vehicle.sourceUrl && data.vehicle.sourceUrl.trim() !== "") {
          orConditions.push({ sourceUrl: data.vehicle.sourceUrl });
        }
        if (orConditions.length > 0) {
          existing = await prisma.vehicle.findFirst({
            where: {
              OR: orConditions
            }
          });
          console.log('[DOUBLON CHECK]', {
            adId: data.vehicle.adId,
            sourceUrl: data.vehicle.sourceUrl,
            existing
          });
          if (existing) {
            return NextResponse.json(
              {
                error: 'Cette annonce a déjà été importée dans la base de données.',
                debug: {
                  adId: data.vehicle.adId,
                  sourceUrl: data.vehicle.sourceUrl,
                  existing
                }
              },
              { status: 400 }
            );
          }
        }
      }
    }
    
    // Création du vendeur
    const seller = await createSeller(data);
    
    return NextResponse.json({ success: true, seller }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du vendeur:', error, error?.message, error?.stack);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du vendeur', details: error?.message },
      { status: 500 }
    );
  }
}
