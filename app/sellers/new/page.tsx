'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewSellerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    isPotential: true,  // Par défaut, c'est un client potentiel
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleMileage: '',
    vehiclePrice: '',
    vehicleDescription: '',
    vehicleImageUrl: '',
    adId: '',           // ID unique de l'annonce
    sourceUrl: '',      // URL source de l'annonce
    vehicleFuel: '',    // Type de carburant
    vehicleTransmission: '', // Type de transmission
    vehiclePower: '',   // Puissance en kW/CV
    inStock: false      // Indique si le véhicule est en stock
  });
  
  // État pour l'URL d'AutoScout24
  const [autoScoutUrl, setAutoScoutUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Effet pour masquer la notification après un délai
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000); // Disparaît après 5 secondes
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'vehicleYear' || name === 'vehicleMileage' || name === 'vehiclePrice') {
      // Convertir en nombre si c'est un champ numérique
      const numValue = value === '' ? '' : Number(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Fonction pour importer les données depuis AutoScout24
  const importFromAutoScout = async () => {
    if (!autoScoutUrl || !autoScoutUrl.includes('autoscout24')) {
      // Afficher une notification d'erreur
      setNotification({
        show: true,
        type: 'error',
        message: 'Veuillez entrer une URL AutoScout24 valide'
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Utiliser notre API d'extraction avec Playwright
      const response = await fetch('/api/autoscout-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: autoScoutUrl }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'extraction des données');
      }
      
      const { data } = result;
      // Vérifier si l'annonce a un ID unique ou une URL source
      if (data.vehicle.adId || data.vehicle.sourceUrl) {
        // Vérifier si cette annonce existe déjà dans le fichier de suivi
        try {
          const checkUrl = data.vehicle.adId 
            ? `/api/check-duplicate?adId=${data.vehicle.adId}` 
            : `/api/check-duplicate?sourceUrl=${encodeURIComponent(data.vehicle.sourceUrl || autoScoutUrl)}`;
          
          const checkResponse = await fetch(checkUrl);
          const checkResult = await checkResponse.json();
          
          if (checkResult.exists) {
            setNotification({
              show: true,
              type: 'warning',
              message: 'Cette annonce a déjà été importée dans la base de données.'
            });
            setIsImporting(false);
            return;
          }
        } catch (error) {
          // Continuer malgré l'erreur de vérification
        }
      }
      // Mettre à jour le formulaire avec les données extraites
      setFormData(prev => ({
        ...prev,
        vehicleMake: data.vehicle.make || '',
        vehicleModel: data.vehicle.model || '',
        vehicleYear: data.vehicle.dateStr || (data.vehicle.year ? String(data.vehicle.year) : ''),
        vehicleMileage: data.vehicle.mileage ? String(data.vehicle.mileage) : '',
        vehiclePrice: data.vehicle.price ? String(data.vehicle.price) : '',
        vehicleDescription: data.vehicle.description || '',
        vehicleImageUrl: data.vehicle.imageUrl || '',
        adId: data.vehicle.adId || '',
        sourceUrl: data.vehicle.sourceUrl || autoScoutUrl,
        vehicleFuel: data.vehicle.fuel || '',
        vehicleTransmission: data.vehicle.transmission || '',
        vehiclePower: data.vehicle.power || '',
        firstName: data.seller.firstName || prev.firstName,
        phone: data.seller.phone || prev.phone,
      }));
      setNotification({
        show: true,
        type: 'success',
        message: 'Données importées avec succès ! Veuillez vérifier et compléter les informations.'
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Une erreur est survenue lors de l\'extraction des données. Veuillez vérifier l\'URL ou réessayer plus tard.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Si c'est une annonce importée avec un ID, l'enregistrer dans notre suivi
      if (formData.adId || formData.sourceUrl) {
        try {
          await fetch('/api/check-duplicate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              adId: formData.adId,
              sourceUrl: formData.sourceUrl,
              make: formData.vehicleMake,
              model: formData.vehicleModel
            }),
          });
        } catch (error) {
          // Continuer malgré l'erreur
        }
      }
      // Préparer les données pour l'API
      const apiData: any = {
        firstName: formData.firstName,
        phone: formData.phone,
        isPotential: formData.isPotential
      };
      // Sécurisation du champ année
      let yearNum: number = Number(formData.vehicleYear);
      if (
        formData.vehicleYear === '' ||
        isNaN(yearNum) ||
        yearNum <= 1900
      ) {
        // Utiliser l'année courante comme valeur par défaut si non spécifiée ou invalide
        yearNum = new Date().getFullYear();
      }
      apiData.vehicle = {
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        year: yearNum, // L'année est maintenant toujours définie (valeur par défaut ou saisie utilisateur)
        mileage: formData.vehicleMileage === '' ? 0 : Number(formData.vehicleMileage),
        price: formData.vehiclePrice === '' ? undefined : Number(formData.vehiclePrice),
        description: formData.vehicleDescription,
        imageUrl: formData.vehicleImageUrl,
        adId: formData.adId,
        sourceUrl: formData.sourceUrl,
        source: formData.sourceUrl.includes('autoscout24') ? 'autoscout24' : '',
        fuel: formData.vehicleFuel || '',
        transmission: formData.vehicleTransmission || '',
        power: formData.vehiclePower || '',
        inStock: formData.inStock
      };
      console.log('vehicleYear:', formData.vehicleYear, 'typeof:', typeof formData.vehicleYear);
      console.log('apiData.vehicle.year:', apiData.vehicle.year, 'typeof:', typeof apiData.vehicle.year);
      console.log('apiData envoyé:', apiData);
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API:', errorText);
        throw new Error('Erreur lors de la création du vendeur');
      }
      router.push('/sellers');
      router.refresh();
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Une erreur est survenue lors de la création du vendeur'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="container mx-auto p-4 relative">
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-md transition-all duration-300 transform translate-y-0 ${notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : notification.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : notification.type === 'warning' ? (
                  <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : notification.type === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setNotification({ show: false, type: '', message: '' })} className={`inline-flex rounded-md p-1.5 ${notification.type === 'success' ? 'text-green-500 hover:bg-green-100' : notification.type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100' : 'text-red-500 hover:bg-red-100'} focus:outline-none`}>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-blue-500 to-violet-600 p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-white">Nouveau client vendeur</h1>
          <Link href="/sellers" className="bg-white text-blue-600 hover:bg-gray-100 py-2 px-4 rounded-md shadow font-medium transition-all duration-200">Retour à la liste</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Carte Vendeur */}
          <Card className="overflow-hidden shadow-lg border-t-4 border-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50">
              <CardTitle className="text-xl font-semibold text-blue-800">Informations du vendeur</CardTitle>
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Importer depuis AutoScout24</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="URL de l'annonce AutoScout24" className="flex-1 p-2 border rounded" value={autoScoutUrl} onChange={(e) => setAutoScoutUrl(e.target.value)} />
                  <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors" onClick={importFromAutoScout} disabled={isImporting}>
                    {isImporting ? 'Importation...' : 'Importer'}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                <input type="checkbox" id="isPotential" name="isPotential" checked={formData.isPotential} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="isPotential" className="text-sm font-medium text-gray-700">Client potentiel (non signé)</label>
              </div>
            </CardContent>
          </Card>

          {/* Carte Véhicule */}
          <Card className="overflow-hidden shadow-lg border-t-4 border-violet-500">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-blue-50">
              <CardTitle className="text-xl font-semibold text-violet-800">Informations du véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                  <input type="text" id="vehicleMake" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                  <input type="text" id="vehicleModel" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-1">Date/Année</label>
                  <input type="text" id="vehicleYear" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} required placeholder="MM/YYYY ou YYYY" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label htmlFor="vehicleMileage" className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                  <input type="number" id="vehicleMileage" name="vehicleMileage" value={formData.vehicleMileage} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label htmlFor="vehiclePrice" className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input type="number" id="vehiclePrice" name="vehiclePrice" value={formData.vehiclePrice} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label htmlFor="vehicleFuel" className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
                  <select id="vehicleFuel" name="vehicleFuel" value={formData.vehicleFuel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="">Sélectionner</option>
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Électrique">Électrique</option>
                    <option value="GPL">GPL</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vehicleTransmission" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                  <select id="vehicleTransmission" name="vehicleTransmission" value={formData.vehicleTransmission} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="">Sélectionner</option>
                    <option value="Manuelle">Manuelle</option>
                    <option value="Automatique">Automatique</option>
                    <option value="Semi-automatique">Semi-automatique</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vehiclePower" className="block text-sm font-medium text-gray-700 mb-1">Puissance (kW/CV)</label>
                  <input type="text" id="vehiclePower" name="vehiclePower" value={formData.vehiclePower} onChange={handleChange} placeholder="Ex: 103kW (140CV)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="vehicleDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea id="vehicleDescription" name="vehicleDescription" value={formData.vehicleDescription} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                  <input type="checkbox" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded" />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">Véhicule en stock</label>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="vehicleImageUrl" className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                  <div className="flex flex-col space-y-2">
                    <input type="text" id="vehicleImageUrl" name="vehicleImageUrl" value={formData.vehicleImageUrl} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    {formData.vehicleImageUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Aperçu de l'image :</p>
                        <img src={formData.vehicleImageUrl} alt="Aperçu du véhicule" className="max-w-full h-auto max-h-64 rounded-md border border-gray-200" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/sellers" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</Link>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
