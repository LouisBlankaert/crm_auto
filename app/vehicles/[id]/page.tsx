import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVehicleById, getAllBuyers, updateVehicleStatus, deleteVehicle } from '@/lib/actions/db-actions';
import { VehicleStatus } from '@/lib/generated/prisma';
import { revalidatePath } from 'next/cache';

export default async function Page({ params }: { params: { id: string } }) {
  // Récupération des données du véhicule avec l'ID extrait des paramètres
  const vehicle = await getVehicleById(params.id);
  
  // Si le véhicule n'existe pas, rediriger vers une page 404
  if (!vehicle) {
    notFound();
  }
  
  // Définition du type pour les acheteurs potentiels
  type PotentialBuyer = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    vehicleInterest?: string | null;
  };

  // Récupérer la liste des acheteurs potentiels si le véhicule est disponible
  let potentialBuyers: PotentialBuyer[] = [];
  if (vehicle && vehicle.status === VehicleStatus.AVAILABLE) {
    const buyers = await getAllBuyers();
    potentialBuyers = buyers.filter(buyer => 
      buyer.vehicleInterest && 
      (buyer.vehicleInterest.toLowerCase().includes(vehicle.make.toLowerCase()) || 
       buyer.vehicleInterest.toLowerCase().includes(vehicle.model.toLowerCase()))
    );
  }
  
  // Fonction pour mettre à jour le statut du véhicule
  async function updateStatus(formData: FormData) {
    'use server';
    
    const status = formData.get('status') as VehicleStatus;
    const buyerId = formData.get('buyerId') as string;
    
    if (!status || !vehicle) return;
    
    try {
      // Utiliser directement la fonction de base de données
      await updateVehicleStatus(vehicle.id, status, buyerId || undefined);
      revalidatePath(`/vehicles/${vehicle.id}`);
      revalidatePath('/vehicles');
      revalidatePath('/');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  }
  
  // Fonction pour supprimer le véhicule
  async function handleDeleteVehicle(formData: FormData) {
    'use server';
    
    const vehicleId = formData.get('vehicleId') as string;
    
    if (!vehicleId) return;
    
    try {
      await deleteVehicle(vehicleId);
      revalidatePath('/vehicles');
      revalidatePath('/');
    } catch (error) {
      console.error('Erreur lors de la suppression du véhicule:', error);
    }
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Détails du véhicule</h1>
        <Link 
          href="/vehicles" 
          className="bg-white text-teal-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Retour à la liste
        </Link>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href={`/vehicles/${vehicle.id}/edit`}>
          <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </Button>
        </Link>
        
        <form action={handleDeleteVehicle}>
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <Button 
            type="submit"
            variant="outline" 
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </Button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="overflow-hidden shadow-lg border-t-4 border-green-500">
            {/* Affichage de l'image du véhicule si elle existe */}
            {(vehicle as any).imageUrl && (
              <div className="w-full h-64 relative">
                <img 
                  src={(vehicle as any).imageUrl} 
                  alt={`${vehicle.make} ${vehicle.model}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-2xl font-bold text-green-800">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Informations générales</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Kilométrage:</span> {vehicle.mileage.toLocaleString()} km
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Prix:</span> {vehicle.price ? vehicle.price.toLocaleString() : 'Non défini'} €
                    </p>
                    {/* @ts-ignore - fuel peut exister mais n'est pas dans le type */}
                    {(vehicle as any).fuel && (
                      <p className="text-gray-600">
                        <span className="font-medium">Carburant:</span> {(vehicle as any).fuel}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Statut:</span>{' '}
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${vehicle.status === VehicleStatus.AVAILABLE ? 'bg-green-100 text-green-800' : ''}
                        ${vehicle.status === VehicleStatus.RESERVED ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${vehicle.status === VehicleStatus.SOLD ? 'bg-red-100 text-red-800' : ''}
                        ${vehicle.status === VehicleStatus.IN_STOCK ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {vehicle.status === VehicleStatus.AVAILABLE && 'Disponible'}
                        {vehicle.status === VehicleStatus.RESERVED && 'Réservé'}
                        {vehicle.status === VehicleStatus.SOLD && 'Vendu'}
                        {vehicle.status === VehicleStatus.IN_STOCK && 'En stock'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Informations client</h3>
                  <div className="space-y-2">
                    {vehicle.seller && (
                      <div>
                        <p className="text-gray-600 font-medium">Vendeur:</p>
                        <Link 
                          href={`/sellers/${vehicle.seller.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {vehicle.seller.firstName} {vehicle.seller.lastName}
                        </Link>
                        <p className="text-gray-600">{vehicle.seller.phone}</p>
                        <p className="text-gray-600">{vehicle.seller.email}</p>
                      </div>
                    )}
                    
                    {vehicle.buyer && (
                      <div className="mt-4">
                        <p className="text-gray-600 font-medium">Acheteur:</p>
                        <Link 
                          href={`/buyers/${vehicle.buyer.id}`}
                          className="text-purple-600 hover:underline"
                        >
                          {vehicle.buyer.firstName} {vehicle.buyer.lastName}
                        </Link>
                        <p className="text-gray-600">{vehicle.buyer.phone}</p>
                        <p className="text-gray-600">{vehicle.buyer.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {vehicle.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-md border-l-2 border-green-300">
                    <p className="text-gray-700">{vehicle.description}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Modifier le statut</h3>
                <form action={updateStatus} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
                      <select
                        id="status"
                        name="status"
                        defaultValue={vehicle.status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value={VehicleStatus.AVAILABLE}>Disponible</option>
                        <option value={VehicleStatus.RESERVED}>Réservé</option>
                        <option value={VehicleStatus.SOLD}>Vendu</option>
                        <option value={VehicleStatus.IN_STOCK}>En stock</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="buyerId" className="block text-sm font-medium text-gray-700 mb-1">Acheteur (si vendu)</label>
                      <select
                        id="buyerId"
                        name="buyerId"
                        defaultValue={vehicle.buyer?.id || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Sélectionner un acheteur</option>
                        {potentialBuyers.map((buyer) => (
                          <option key={buyer.id} value={buyer.id}>
                            {buyer.firstName} {buyer.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Mettre à jour le statut
                    </button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="overflow-hidden shadow-lg border-t-4 border-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="text-xl font-semibold text-indigo-800">
                Acheteurs potentiels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {potentialBuyers.length > 0 ? (
                <div className="space-y-4">
                  {potentialBuyers.map((buyer) => (
                    <div key={buyer.id} className="bg-indigo-50 p-3 rounded-md hover:shadow-md transition-all duration-200">
                      <Link 
                        href={`/buyers/${buyer.id}`}
                        className="text-indigo-700 font-medium hover:underline"
                      >
                        {buyer.firstName} {buyer.lastName}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1">{buyer.phone}</p>
                      <p className="text-gray-600 text-sm">{buyer.email}</p>
                      {buyer.vehicleInterest && (
                        <div className="mt-2 text-sm">
                          <p className="text-indigo-600 font-medium">Intérêt:</p>
                          <p className="text-gray-700 bg-white p-2 rounded-md mt-1 border-l-2 border-indigo-300">
                            {buyer.vehicleInterest}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center">
                  {vehicle.status === VehicleStatus.AVAILABLE 
                    ? "Aucun acheteur potentiel trouvé pour ce véhicule."
                    : "Le véhicule n'est plus disponible."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
