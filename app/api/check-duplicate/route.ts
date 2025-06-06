import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier JSON qui stocke les IDs des annonces importées
const IMPORTED_ADS_FILE = path.join(process.cwd(), 'data', 'imported-ads.json');

// Fonction pour lire les annonces importées
function getImportedAds() {
  try {
    // Vérifier si le répertoire data existe, sinon le créer
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Vérifier si le fichier existe, sinon le créer
    if (!fs.existsSync(IMPORTED_ADS_FILE)) {
      fs.writeFileSync(IMPORTED_ADS_FILE, JSON.stringify({ ads: [] }));
      return { ads: [] };
    }
    
    // Lire le fichier
    const data = fs.readFileSync(IMPORTED_ADS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des annonces importées:', error);
    return { ads: [] };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID de l'annonce depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');
    const sourceUrl = searchParams.get('sourceUrl');
    
    if (!adId && !sourceUrl) {
      return NextResponse.json(
        { error: 'Veuillez fournir un adId ou une sourceUrl pour vérifier les doublons' },
        { status: 400 }
      );
    }
    
    // Lire les annonces importées
    const importedAds = getImportedAds();
    
    // Vérifier si l'annonce existe déjà
    let exists = false;
    if (
      (adId && adId.trim() !== "") ||
      (sourceUrl && sourceUrl.trim() !== "")
    ) {
      exists = importedAds.ads.some((ad: any) =>
        (adId && adId.trim() !== "" && ad.adId === adId) ||
        (sourceUrl && sourceUrl.trim() !== "" && ad.sourceUrl === sourceUrl)
      );
    }
    return NextResponse.json({
      exists,
      message: exists ? 'Cette annonce a déjà été importée' : 'Cette annonce n\'a pas encore été importée'
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification des doublons:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification des doublons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, sourceUrl, make, model } = body;
    
    if (!adId && !sourceUrl) {
      return NextResponse.json(
        { error: 'Veuillez fournir un adId ou une sourceUrl pour enregistrer l\'annonce' },
        { status: 400 }
      );
    }
    
    // Lire les annonces importées
    const importedAds = getImportedAds();
    
    // Vérifier si l'annonce existe déjà
    const exists = importedAds.ads.some((ad: any) => 
      (adId && ad.adId === adId) || (sourceUrl && ad.sourceUrl === sourceUrl)
    );
    
    if (exists) {
      return NextResponse.json({
        success: false,
        message: 'Cette annonce a déjà été importée'
      });
    }
    
    // Ajouter l'annonce à la liste
    importedAds.ads.push({
      adId,
      sourceUrl,
      make,
      model,
      importedAt: new Date().toISOString()
    });
    
    // Écrire dans le fichier
    fs.writeFileSync(IMPORTED_ADS_FILE, JSON.stringify(importedAds, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Annonce enregistrée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de l\'annonce' },
      { status: 500 }
    );
  }
}
