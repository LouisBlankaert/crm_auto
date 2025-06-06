'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewVehiclePage() {
  const router = useRouter();
  
  // Définition des types pour les vendeurs
  type Seller = {
    id: string;
    firstName: string;
    lastName: string;
  };
  
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: '',
    price: '',
    description: '',
    sellerId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Charger les vendeurs pour le sélecteur
    const fetchSellers = async () => {
      try {
        const response = await fetch('/api/sellers/list');
        const data = await response.json();
        
        if (data.success) {
          setSellers(data.sellers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des vendeurs:', error);
      }
    };
    
    fetchSellers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convertir en nombre si c'est un champ numérique
    if (name === 'year' || name === 'mileage' || name === 'price') {
      const numValue = value === '' ? '' : Number(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Envoyer les données à l'API
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du véhicule');
      }

      // Rediriger vers la liste des véhicules
      router.push('/vehicles');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création du véhicule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Nouveau véhicule</h1>
        <Link 
          href="/vehicles" 
          className="bg-white text-teal-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Retour à la liste
        </Link>
      </div>

      <Card className="overflow-hidden shadow-lg border-t-4 border-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardTitle className="text-xl font-semibold text-green-800">Informations du véhicule</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700 mb-1">Vendeur</label>
                <select
                  id="sellerId"
                  name="sellerId"
                  value={formData.sellerId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionner un vendeur</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.firstName} {seller.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link 
                href="/vehicles"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
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
