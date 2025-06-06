import { NextResponse } from 'next/server';
import { PrismaClient, VehicleStatus } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: VehicleStatus.AVAILABLE
      },
      include: {
        seller: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ success: true, vehicles }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules disponibles:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des véhicules disponibles' },
      { status: 500 }
    );
  }
}
