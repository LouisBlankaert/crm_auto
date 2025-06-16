"use client";

import React from 'react';
import Link from 'next/link';
import { VehicleStatus } from '@/lib/generated/prisma';

// Type pour les véhicules
type VehicleWithSellerInfo = {
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
};

interface VehicleCardProps {
  vehicle: VehicleWithSellerInfo;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link 
      href={`/vehicles/${vehicle.id}`}
      className="block"
      prefetch={true}
    >
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
        {/* Image du véhicule avec proportions optimisées */}
        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
          {vehicle.imageUrl ? (
            <img 
              src={vehicle.imageUrl} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Pas d'image</span>
            </div>
          )}
          
          {/* Badge de statut */}
          <div className="absolute top-2 right-2">
            {vehicle.status === VehicleStatus.AVAILABLE && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-500 text-white shadow-sm">
                Disponible
              </span>
            )}
            {vehicle.status === VehicleStatus.RESERVED && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500 text-white shadow-sm">
                Réservé
              </span>
            )}
            {vehicle.status === VehicleStatus.SOLD && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-500 text-white shadow-sm">
                Vendu
              </span>
            )}
            {vehicle.status === VehicleStatus.IN_STOCK && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500 text-white shadow-sm">
                En stock
              </span>
            )}
          </div>
        </div>
        
        {/* Informations du véhicule */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-gray-800">
              {vehicle.make} {vehicle.model}
            </h4>
            {vehicle.price && (
              <p className="text-lg font-bold text-blue-600">
                {vehicle.price.toLocaleString()} €
              </p>
            )}
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Année:</span> {vehicle.year}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Km:</span> {vehicle.mileage.toLocaleString()}
            </p>
            {vehicle.fuel && (
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Carburant:</span> {vehicle.fuel}
              </p>
            )}
            {vehicle.transmission && (
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Boîte:</span> {vehicle.transmission}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
