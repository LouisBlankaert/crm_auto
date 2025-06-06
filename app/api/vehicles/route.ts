import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, VehicleStatus } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation des données
    if (!data.make || !data.model || !data.year || !data.mileage || !data.price || !data.sellerId) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Création du véhicule
    const vehicle = await prisma.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        year: Number(data.year),
        mileage: Number(data.mileage),
        price: Number(data.price),
        description: data.description || '',
        status: VehicleStatus.AVAILABLE,
        sellerId: data.sellerId
      }
    });
    
    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du véhicule' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        seller: true,
        buyer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ success: true, vehicles }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des véhicules' },
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
        { error: 'L\'identifiant du véhicule et le statut sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier que le statut est valide
    if (!Object.values(VehicleStatus).includes(data.status)) {
      return NextResponse.json(
        { error: 'Le statut fourni n\'est pas valide' },
        { status: 400 }
      );
    }
    
    // Mise à jour du statut du véhicule
    const updateData: any = { status: data.status };
    
    // Si le véhicule est vendu, associer l'acheteur
    if (data.status === VehicleStatus.SOLD && data.buyerId) {
      updateData.buyerId = data.buyerId;
    }
    
    const vehicle = await prisma.vehicle.update({
      where: { id: data.id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, vehicle }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du véhicule' },
      { status: 500 }
    );
  }
}
