import React from 'react';
import Link from 'next/link';
import { getAllSellers } from '@/lib/actions/db-actions';
import { SellerSection } from './components/SellerSection';

export default async function SellersPage() {
  // Récupération des données réelles depuis la base de données
  const sellers = await getAllSellers();

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-white">Clients vendeurs</h1>
        <Link 
          href="/sellers/new" 
          className="bg-white text-purple-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow transition-all duration-200 font-medium"
        >
          Ajouter un vendeur
        </Link>
      </div>

      {/* Utilisation du composant client pour afficher les vendeurs et leurs véhicules */}
      <SellerSection sellers={sellers} />
    </main>
  );
}
