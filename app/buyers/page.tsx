import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllBuyers } from '@/lib/actions/db-actions';

export default async function BuyersPage() {
  // Récupération des données réelles depuis la base de données
  const buyers = await getAllBuyers();

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Clients acheteurs</h1>
        <Link 
          href="/buyers/new" 
          className="bg-white text-indigo-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Ajouter un acheteur
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {buyers.length > 0 ? (
          buyers.map((buyer) => (
            <Card key={buyer.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-700">
                        {buyer.firstName} {buyer.lastName}
                      </h3>
                      <p className="text-gray-600">📞 {buyer.phone}</p>
                      <p className="text-gray-600">✉️ {buyer.email}</p>
                    </div>
                    {buyer.vehicleInterest && (
                      <div className="mt-4">
                        <h4 className="font-medium text-indigo-700">Recherche véhicule:</h4>
                        <p className="bg-indigo-50 p-2 rounded-md text-indigo-800">{buyer.vehicleInterest}</p>
                      </div>
                    )}
                    <div className="mt-4 md:mt-0 flex items-center">
                      <Link 
                        href={`/buyers/${buyer.id}`}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:shadow-md transition-all duration-200"
                      >
                        Détails
                      </Link>
                    </div>
                  </div>

                  {buyer.matchingVehicles && buyer.matchingVehicles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-green-700">Véhicules correspondants:</h4>
                      <div className="space-y-2">
                        {buyer.matchingVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="bg-green-50 p-2 rounded-md">
                            <p className="text-green-800">
                              {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.price ? `${vehicle.price.toLocaleString()}€` : 'Prix non défini'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2 text-blue-600"> Derniers échanges</h4>
                    <div className="space-y-2">
                      {buyer.interactions.slice(0, 2).map((interaction, index) => (
                        <div key={index} className="text-sm bg-blue-50 p-2 rounded-md mb-2 border-l-2 border-blue-400">
                          <p className="text-xs text-blue-500">{interaction.date ? new Date(interaction.date).toLocaleDateString() : 'Date non définie'}</p>
                          {interaction.notes}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Aucun client acheteur pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
