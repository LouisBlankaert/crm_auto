'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Définir un type pour les véhicules côté client
type VehicleType = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number | null;
  status: string;
  seller?: { firstName: string; lastName: string } | null;
};

export default function NewBuyerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    vehicleInterest: '',
    initialNotes: '',
    interestedInVehicle: false,
    selectedVehicleId: ''
  });
  const [availableVehicles, setAvailableVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Charger les véhicules disponibles au chargement de la page via l'API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles/available');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des véhicules');
        }
        
        const data = await response.json();
        if (data.success && data.vehicles) {
          setAvailableVehicles(data.vehicles);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        vehicleInterest: formData.vehicleInterest,
        initialNotes: formData.initialNotes,
        // Ajouter l'ID du véhicule sélectionné si l'option est cochée
        interestedVehicleId: formData.interestedInVehicle ? formData.selectedVehicleId : undefined
      };
      
      // Envoyer les données à l'API
      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'acheteur');
      }

      // Rediriger vers la liste des acheteurs
      router.push('/buyers');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création de l\'acheteur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Nouveau client acheteur</h1>
        <Link 
          href="/buyers" 
          className="bg-white text-indigo-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Retour à la liste
        </Link>
      </div>

      <Card className="overflow-hidden shadow-lg border-t-4 border-indigo-500">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="text-xl font-semibold text-indigo-800">Informations de l'acheteur</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-indigo-800 mb-4">Recherche véhicule</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="vehicleInterest" className="block text-sm font-medium text-gray-700 mb-1">Intérêt véhicule (type, budget, caractéristiques...)</label>
                  <input
                    type="text"
                    id="vehicleInterest"
                    name="vehicleInterest"
                    value={formData.vehicleInterest}
                    onChange={handleChange}
                    placeholder="Ex: SUV compact, budget 20-25k€, diesel, moins de 50 000 km..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* Sélection d'un véhicule existant */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="interestedInVehicle"
                      name="interestedInVehicle"
                      checked={formData.interestedInVehicle}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="interestedInVehicle" className="ml-2 block text-sm font-medium text-gray-700">
                      Associer un véhicule du stock à cet acheteur
                    </label>
                  </div>
                  
                  {formData.interestedInVehicle && (
                    <div className="bg-indigo-50 p-4 rounded-md">
                      {isLoading ? (
                        <p className="text-gray-600">Chargement des véhicules disponibles...</p>
                      ) : availableVehicles.length === 0 ? (
                        <p className="text-gray-600">Aucun véhicule disponible dans le stock</p>
                      ) : (
                        <div>
                          <label htmlFor="selectedVehicleId" className="block text-sm font-medium text-gray-700 mb-2">
                            Sélectionner un véhicule
                          </label>
                          <select
                            id="selectedVehicleId"
                            name="selectedVehicleId"
                            value={formData.selectedVehicleId}
                            onChange={handleChange}
                            required={formData.interestedInVehicle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- Sélectionner un véhicule --</option>
                            {availableVehicles.map(vehicle => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.price ? `${vehicle.price.toLocaleString()} €` : 'Prix non défini'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="initialNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes initiales</label>
                  <textarea
                    id="initialNotes"
                    name="initialNotes"
                    value={formData.initialNotes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Informations complémentaires sur le client et ses besoins..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link 
                href="/buyers"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
