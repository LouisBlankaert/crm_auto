import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/actions/db-actions';

export default async function Dashboard() {
  // Récupération des statistiques réelles depuis la base de données
  const stats = await getDashboardStats();

  return (
    <main className="container mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-t-4 border-green-500 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-sm font-medium text-green-700">Clients potentiels</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="text-4xl font-bold text-green-600">{stats.potentialClients || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-blue-500 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-sm font-medium text-blue-700">Véhicules en stock</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="text-4xl font-bold text-blue-600">{stats.vehiclesInStock || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-orange-500 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardTitle className="text-sm font-medium text-orange-700">Clients à rappeler</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="text-4xl font-bold text-amber-600">{stats.clientsToCall || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-teal-500 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-teal-100">
            <CardTitle className="text-sm font-medium text-teal-700">Total clients</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="text-4xl font-bold text-teal-600">{stats.totalClients || 0}</div>
          </CardContent>
        </Card>
      </div>


    </main>
  );
}
