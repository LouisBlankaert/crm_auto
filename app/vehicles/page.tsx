import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getAllVehicles } from '@/lib/actions/db-actions';
import { VehicleStatus } from '@/lib/generated/prisma';

export default async function VehiclesPage() {
  // Récupération des données réelles depuis la base de données
  const vehicles = await getAllVehicles();

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Véhicules</h1>
        <Link 
          href="/vehicles/new" 
          className="bg-white text-teal-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Ajouter un véhicule
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-green-500">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Image du véhicule à gauche */}
                  <div className="md:w-1/4 h-48 md:h-auto relative overflow-hidden">
                    {/* @ts-ignore - imageUrl peut exister mais n'est pas dans le type */}
                    {vehicle.imageUrl ? (
                      <img 
                        /* @ts-ignore - imageUrl peut exister mais n'est pas dans le type */
                        src={vehicle.imageUrl} 
                        alt={`${vehicle.make} ${vehicle.model}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Pas d'image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Informations du véhicule à droite */}
                  <div className="p-6 flex-1 flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-green-700">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </h3>
                      <p className="text-gray-600">🚗 {vehicle.mileage.toLocaleString()} km</p>
                      <p className="text-gray-600">💰 {vehicle.price ? vehicle.price.toLocaleString() : 0} €</p>
                      {/* @ts-ignore - fuel peut exister mais n'est pas dans le type */}
                      {vehicle.fuel && <p className="text-gray-600">⛽ {vehicle.fuel}</p>}
                      
                      <div className="mt-2">
                        {vehicle.status === VehicleStatus.AVAILABLE && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm">
                            Disponible
                          </span>
                        )}
                        {vehicle.status === VehicleStatus.RESERVED && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-sm">
                            Réservé
                          </span>
                        )}
                        {vehicle.status === VehicleStatus.SOLD && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm">
                            Vendu
                          </span>
                        )}
                        {vehicle.status === VehicleStatus.IN_STOCK && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm">
                            En stock
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-gray-600">
                          <span className="font-medium">Vendeur:</span>{' '}
                          {vehicle.seller ? (
                            <Link 
                              href={`/sellers/${vehicle.seller.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {vehicle.seller.firstName} {vehicle.seller.lastName}
                            </Link>
                          ) : (
                            <span className="text-gray-500">Non assigné</span>
                          )}
                        </p>
                        
                        {vehicle.buyer && (
                          <p className="text-gray-600 mt-1">
                            <span className="font-medium">Acheteur:</span>{' '}
                            <Link 
                              href={`/buyers/${vehicle.buyer.id}`}
                              className="text-purple-600 hover:underline"
                            >
                              {vehicle.buyer.firstName} {vehicle.buyer.lastName}
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Link 
                        href={`/vehicles/${vehicle.id}`}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors inline-flex items-center"
                      >
                        <span>Détails</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {vehicle.description && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md border-l-2 border-green-300">
                      {vehicle.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Aucun véhicule pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
