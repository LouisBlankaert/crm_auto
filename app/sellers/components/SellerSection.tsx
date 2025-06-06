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
  return (
    <div className="grid grid-cols-1 gap-8">
      {sellers.length > 0 ? (
        sellers.map((seller) => (
          <Card key={seller.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
            {/* En-tête du vendeur */}
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div>
                <CardTitle className="text-xl font-bold text-blue-800">
                  {seller.firstName} {seller.lastName}
                </CardTitle>
                <div className="mt-1 space-y-1">
                  {seller.phone && (
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Tél:</span> {seller.phone}
                    </p>
                  )}
                  {seller.email && (
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Email:</span> {seller.email}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Liste des véhicules */}
              {seller.vehicles && seller.vehicles.length > 0 ? (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Véhicules ({seller.vehicles.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {seller.vehicles.map((vehicle) => (
                      <div key={vehicle.id}>
                        <VehicleCard vehicle={vehicle} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Aucun véhicule associé à ce vendeur
                </div>
              )}
            </CardContent>
          </Card>
        ))
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
