"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleCard } from './VehicleCard';
import { VehicleStatus } from '@/lib/generated/prisma';

// Types
type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number | null;
  status: VehicleStatus;
  imageUrl?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  [key: string]: any; // Pour permettre d'autres propriétés
};

type Seller = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  vehicles: Vehicle[];
  [key: string]: any; // Pour permettre d'autres propriétés
};

interface SellerSectionProps {
  sellers: Seller[];
}

export function SellerSection({ sellers }: SellerSectionProps) {
  // Extraire tous les véhicules de tous les vendeurs
  const allVehicles = sellers.flatMap(seller => 
    seller.vehicles.map(vehicle => ({
      ...vehicle,
      sellerName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim(),
      sellerId: seller.id
    }))
  );

  return (
    <div>
      {sellers.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-700">Tous les véhicules ({allVehicles.length})</h3>
          </CardHeader>
          <CardContent>
            {allVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allVehicles.map((vehicle) => (
                  <div key={vehicle.id}>
                    <VehicleCard vehicle={vehicle} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Aucun véhicule disponible
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Aucun client vendeur pour le moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
