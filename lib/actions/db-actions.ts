import { PrismaClient, VehicleStatus, Prisma, ReminderStatus } from '@/lib/generated/prisma';

// Initialisation du client Prisma
const prisma = new PrismaClient();

// Fonctions pour le tableau de bord
export async function getDashboardStats() {
  try {
    // Clients potentiels (vendeurs avec isPotential = true)
    const potentialClients = await prisma.seller.count({
      where: { isPotential: true }
    });

    // Véhicules en stock
    const vehiclesInStock = await prisma.vehicle.count({
      where: { status: VehicleStatus.IN_STOCK }
    });

    // Clients à rappeler (rappels à faire)
    const clientsToCall = await prisma.reminder.count({
      where: { status: ReminderStatus.TODO }
    });

    // Nombre total de clients (vendeurs + acheteurs)
    const sellersCount = await prisma.seller.count();
    const buyersCount = await prisma.buyer.count();
    const totalClients = sellersCount + buyersCount;

    return {
      potentialClients,
      vehiclesInStock,
      clientsToCall,
      totalClients
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    // Valeurs par défaut en cas d'erreur
    return {
      potentialClients: 0,
      vehiclesInStock: 0,
      clientsToCall: 0,
      totalClients: 0
    };
  }
}

// Fonctions pour les vendeurs
export async function getAllSellers() {
  try {
    const sellers = await prisma.seller.findMany({
      include: {
        vehicles: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return sellers;
  } catch (error) {
    console.error('Erreur lors de la récupération des vendeurs:', error);
    return [];
  }
}

export async function getSellerById(id: string) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { id },
      include: {
        vehicles: true,
        reminders: {
          orderBy: {
            date: 'asc'
          }
        },
        interactions: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
    return seller;
  } catch (error) {
    console.error(`Erreur lors de la récupération du vendeur ${id}:`, error);
    return null;
  }
}

export async function createSeller(data: any) {
  try {
    // Vérifier que les données du véhicule sont présentes
    if (!data.vehicle) {
      throw new Error('Un véhicule est requis pour créer un vendeur');
    }

    // Utiliser une transaction pour s'assurer que le vendeur et le véhicule sont créés ensemble
    const result = await prisma.$transaction(async (tx) => {
      // Créer le vendeur avec le champ isPotential
      const seller = await tx.seller.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          isPotential: data.isPotential !== undefined ? data.isPotential : true // Par défaut à true si non spécifié
        }
      });
      
      // Créer le véhicule associé au vendeur (obligatoire)
      // Déterminer le statut du véhicule en fonction de inStock
      const vehicleStatus = data.vehicle.inStock ? VehicleStatus.IN_STOCK : VehicleStatus.AVAILABLE;
      
      const vehicle = await tx.vehicle.create({
        data: {
          make: data.vehicle.make,
          model: data.vehicle.model,
          year: data.vehicle.year,
          mileage: data.vehicle.mileage,
          price: data.vehicle.price,
          description: data.vehicle.description,
          imageUrl: data.vehicle.imageUrl || null,
          fuel: data.vehicle.fuel || null,
          transmission: data.vehicle.transmission || null,
          power: data.vehicle.power || null,
          adId: data.vehicle.adId || null,
          sourceUrl: data.vehicle.sourceUrl || null,
          source: data.vehicle.source || (data.vehicle.sourceUrl?.includes('autoscout24') ? 'autoscout24' : null),
          status: vehicleStatus,
          sellerId: seller.id
        }
      });
      
      return { seller, vehicle };
    });
    
    return result.seller;
  } catch (error) {
    console.error('Erreur lors de la création du vendeur:', error);
    throw error;
  }
}

// Fonctions pour les acheteurs
export async function getAllBuyers() {
  try {
    const buyers = await prisma.buyer.findMany({
      include: {
        interactions: {
          orderBy: {
            date: 'desc'
          },
          take: 2
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Pour chaque acheteur, trouver les véhicules correspondant à ses intérêts
    const buyersWithMatchingVehicles = await Promise.all(
      buyers.map(async (buyer) => {
        if (!buyer.vehicleInterest) return { ...buyer, matchingVehicles: [] };
        
        // Recherche simple basée sur les mots-clés dans vehicleInterest
        const keywords = buyer.vehicleInterest.toLowerCase().split(/\s+/);
        
        const matchingVehicles: Prisma.VehicleGetPayload<{}>[] = await prisma.vehicle.findMany({
          where: {
            status: VehicleStatus.AVAILABLE,
            OR: keywords.map(keyword => ({
              OR: [
                { make: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
                { model: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: keyword, mode: Prisma.QueryMode.insensitive } }
              ]
            }))
          },
          take: 3
        });
        
        return { ...buyer, matchingVehicles };
      })
    );
    
    return buyersWithMatchingVehicles;
  } catch (error) {
    console.error('Erreur lors de la récupération des acheteurs:', error);
    return [];
  }
}

export async function getBuyerById(id: string) {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        reminders: {
          orderBy: {
            date: 'asc'
          }
        },
        interactions: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
    
    if (!buyer) return null;
    
    // Trouver les véhicules correspondant à ses intérêts
    let matchingVehicles: Prisma.VehicleGetPayload<{}>[] = [];
    if (buyer.vehicleInterest) {
      const keywords = buyer.vehicleInterest.toLowerCase().split(/\s+/);
      
      matchingVehicles = await prisma.vehicle.findMany({
        where: {
          status: VehicleStatus.AVAILABLE,
          OR: keywords.map(keyword => ({
            OR: [
              { make: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
              { model: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: keyword, mode: Prisma.QueryMode.insensitive } }
            ]
          }))
        }
      });
    }
    
    return { ...buyer, matchingVehicles };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'acheteur ${id}:`, error);
    return null;
  }
}

export async function createBuyer(data: any) {
  try {
    // Utiliser une transaction pour s'assurer que toutes les opérations sont effectuées ensemble
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'acheteur
      const buyer = await tx.buyer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          vehicleInterest: data.vehicleInterest
        }
      });
      
      // Créer une interaction initiale si des notes sont fournies
      if (data.initialNotes) {
        await tx.interaction.create({
          data: {
            notes: data.initialNotes,
            buyerId: buyer.id
          }
        });
      }
      
      // Si un véhicule est sélectionné, l'associer à l'acheteur
      if (data.interestedVehicleId) {
        // Vérifier que le véhicule existe et est disponible
        const vehicle = await tx.vehicle.findUnique({
          where: { id: data.interestedVehicleId }
        });
        
        if (vehicle && vehicle.status === VehicleStatus.AVAILABLE) {
          // Mettre à jour le véhicule pour l'associer à l'acheteur
          await tx.vehicle.update({
            where: { id: data.interestedVehicleId },
            data: { buyerId: buyer.id }
          });
          
          // Ajouter une interaction pour noter l'intérêt pour ce véhicule spécifique
          await tx.interaction.create({
            data: {
              notes: `Intéressé par le véhicule: ${vehicle.make} ${vehicle.model} (${vehicle.year})`,
              buyerId: buyer.id
            }
          });
        }
      }
      
      return buyer;
    });
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la création de l\'acheteur:', error);
    throw error;
  }
}

// Fonctions pour les véhicules
export async function getAllVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        seller: true,
        buyer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return vehicles;
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    return [];
  }
}

export async function getVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        seller: true,
        buyer: true
      }
    });
    return vehicle;
  } catch (error) {
    console.error(`Erreur lors de la récupération du véhicule ${id}:`, error);
    return null;
  }
}

export async function updateVehicleStatus(id: string, status: VehicleStatus, buyerId?: string) {
  try {
    const updateData: any = { status };
    
    // Si le véhicule est vendu, associer l'acheteur
    if (status === VehicleStatus.SOLD && buyerId) {
      updateData.buyerId = buyerId;
    }
    
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
    });
    
    return vehicle;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut du véhicule ${id}:`, error);
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    // Supprimer le véhicule
    const vehicle = await prisma.vehicle.delete({
      where: { id }
    });
    
    return vehicle;
  } catch (error) {
    console.error(`Erreur lors de la suppression du véhicule ${id}:`, error);
    throw error;
  }
}

// Fonctions pour les rappels
export async function getAllReminders() {
  try {
    const reminders = await prisma.reminder.findMany({
      include: {
        seller: true,
        buyer: true
      },
      orderBy: [
        { status: 'asc' as const }, // TODO en premier, puis POSTPONED, puis DONE
        { date: 'asc' as const }
      ]
    });
    
    // Transformer les données pour l'affichage
    const formattedReminders = reminders.map(reminder => {
      const clientName = reminder.seller 
        ? `${reminder.seller.firstName} ${reminder.seller.lastName}`
        : reminder.buyer
          ? `${reminder.buyer.firstName} ${reminder.buyer.lastName}`
          : 'Client inconnu';
          
      const clientType = reminder.seller ? 'seller' : 'buyer';
      const clientId = reminder.seller ? reminder.seller.id : reminder.buyer ? reminder.buyer.id : '';
      
      return {
        ...reminder,
        clientName,
        clientType,
        clientId
      };
    });
    
    return formattedReminders;
  } catch (error) {
    console.error('Erreur lors de la récupération des rappels:', error);
    return [];
  }
}

export async function createReminder(data: any) {
  try {
    // Déterminer si le rappel concerne un vendeur ou un acheteur
    const reminderData: any = {
      date: new Date(data.date),
      reason: data.reason,
      notes: data.notes,
      status: ReminderStatus.TODO
    };
    
    if (data.sellerId) {
      reminderData.sellerId = data.sellerId;
    } else if (data.buyerId) {
      reminderData.buyerId = data.buyerId;
    }
    
    const reminder = await prisma.reminder.create({
      data: reminderData
    });
    
    return reminder;
  } catch (error) {
    console.error('Erreur lors de la création du rappel:', error);
    throw error;
  }
}

export async function updateReminderStatus(id: string, status: ReminderStatus) {
  try {
    const reminder = await prisma.reminder.update({
      where: { id },
      data: { status }
    });
    
    return reminder;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut du rappel ${id}:`, error);
    throw error;
  }
}
