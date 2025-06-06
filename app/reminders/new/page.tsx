'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewReminderPage() {
  const router = useRouter();
  // Définition des types pour les clients
  type Seller = {
    id: string;
    firstName: string;
    lastName: string;
  };

  type Buyer = {
    id: string;
    firstName: string;
    lastName: string;
  };

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [formData, setFormData] = useState({
    clientType: 'seller',
    clientId: '',
    date: '',
    reason: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Charger les vendeurs et acheteurs pour les sélecteurs
    const fetchClients = async () => {
      try {
        const [sellersRes, buyersRes] = await Promise.all([
          fetch('/api/sellers/list').then(res => res.json()),
          fetch('/api/buyers/list').then(res => res.json())
        ]);
        
        if (sellersRes.success) setSellers(sellersRes.sellers);
        if (buyersRes.success) setBuyers(buyersRes.buyers);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      }
    };
    
    fetchClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API
      const apiData: Record<string, any> = {
        ...formData,
        [formData.clientType === 'seller' ? 'sellerId' : 'buyerId']: formData.clientId
      };
      
      // Supprimer clientType et clientId qui ne sont pas nécessaires pour l'API
      if ('clientType' in apiData) delete apiData.clientType;
      if ('clientId' in apiData) delete apiData.clientId;

      // Envoyer les données à l'API
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du rappel');
      }

      // Rediriger vers la liste des rappels
      router.push('/reminders');
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création du rappel');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtenir la liste des clients en fonction du type sélectionné
  const clientOptions = formData.clientType === 'seller' ? sellers : buyers;

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-orange-500 to-amber-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Nouveau rappel client</h1>
        <Link 
          href="/reminders" 
          className="bg-white text-amber-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Retour à la liste
        </Link>
      </div>

      <Card className="overflow-hidden shadow-lg border-t-4 border-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="text-xl font-semibold text-amber-800">Informations du rappel</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 mb-1">Type de client</label>
                <select
                  id="clientType"
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="seller">Vendeur</option>
                  <option value="buyer">Acheteur</option>
                </select>
              </div>
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Sélectionner un client</option>
                  {clientOptions.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date et heure du rappel</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Motif du rappel</label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Suivi offre, Confirmation rendez-vous..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Informations complémentaires sur le rappel..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link 
                href="/reminders"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-md hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
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
