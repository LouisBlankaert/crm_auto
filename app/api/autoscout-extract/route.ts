import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.includes('autoscout24')) {
      return NextResponse.json(
        { error: 'URL invalide. Veuillez fournir une URL AutoScout24 valide.' },
        { status: 400 }
      );
    }
    
    console.log('Extraction des données depuis:', url);
    
    // Lancer un navigateur headless avec Playwright
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    
    const page = await context.newPage();
    
    // Configurer les timeouts
    page.setDefaultTimeout(30000);
    
    try {
      // Naviguer vers l'URL et attendre que la page soit complètement chargée
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Accepter les cookies si nécessaire
      try {
        const cookieButton = await page.waitForSelector('button[data-testid="consent-accept-btn"]', { timeout: 3000 });
        if (cookieButton) {
          await cookieButton.click();
          // Attendre que le dialogue des cookies disparaisse
          await page.waitForSelector('button[data-testid="consent-accept-btn"]', { state: 'hidden', timeout: 3000 }).catch(() => {});
        }
      } catch (e) {
        // Pas de bouton de cookies trouvé ou déjà accepté, on continue
      }
      
      // Extraire les informations du véhicule
      const vehicleData = await page.evaluate(() => {
        // Fonctions utilitaires pour extraire le texte et les URLs des images
        const getText = (element: Element | null): string => {
          return element?.textContent?.trim() || '';
        };
        
        const getImageUrl = (element: Element | null): string => {
          if (!element) return '';
          
          // Chercher d'abord dans src
          const src = element.getAttribute('src');
          if (src && src.length > 10) return src;
          
          // Puis dans data-src
          const dataSrc = element.getAttribute('data-src');
          if (dataSrc && dataSrc.length > 10) return dataSrc;
          
          // Puis dans srcset
          const srcset = element.getAttribute('srcset');
          if (srcset && srcset.length > 10) {
            const srcsetParts = srcset.split(',');
            if (srcsetParts.length > 0) {
              const lastPart = srcsetParts[srcsetParts.length - 1];
              const url = lastPart.trim().split(' ')[0];
              if (url) return url;
            }
          }
          
          return '';
        };
        
        // Extraire le carburant
        const getFuel = () => {
          // Sélecteurs pour le carburant
          const fuelSelectors = [
            '[data-testid="vehicle-details-item"]',
            '.VehicleOverview_itemText__AI4dA',
            '.SellerNotesSection_content__te2EB'
          ];
          
          // Rechercher dans les éléments de la page
          const fuelTypes = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];
          
          // Parcourir tous les éléments de texte de la page
          const allTextElements = document.querySelectorAll('div, span, p');
          for (const el of allTextElements) {
            const text = el.textContent?.toLowerCase() || '';
            
            // Vérifier si le texte contient un type de carburant
            for (const fuelType of fuelTypes) {
              if (text.includes(fuelType.toLowerCase())) {
                return fuelType;
              }
            }
          }
          
          // Rechercher spécifiquement dans la description
          const description = document.querySelector('.SellerNotesSection_content__te2EB');
          if (description) {
            const text = description.textContent?.toLowerCase() || '';
            if (text.includes('essence')) return 'Essence';
            if (text.includes('diesel')) return 'Diesel';
            if (text.includes('hybride')) return 'Hybride';
            if (text.includes('électrique') || text.includes('electrique')) return 'Électrique';
            if (text.includes('gpl')) return 'GPL';
          }
          
          return '';
        };
        
        // Extraire la transmission
        const getTransmission = () => {
          // Rechercher dans les éléments de la page
          const allTextElements = document.querySelectorAll('div, span, p');
          for (const el of allTextElements) {
            const text = el.textContent?.toLowerCase() || '';
            
            // Vérifier si le texte contient un type de transmission
            if (text.includes('automatique') || text.includes('automaat')) return 'Automatique';
            if (text.includes('manuelle') || text.includes('manuel')) return 'Manuelle';
            if (text.includes('semi-automatique')) return 'Semi-automatique';
          }
          
          // Rechercher spécifiquement dans la description
          const description = document.querySelector('.SellerNotesSection_content__te2EB');
          if (description) {
            const text = description.textContent?.toLowerCase() || '';
            if (text.includes('automatique') || text.includes('automaat')) return 'Automatique';
            if (text.includes('manuelle') || text.includes('manuel')) return 'Manuelle';
            if (text.includes('semi-automatique')) return 'Semi-automatique';
          }
          
          return '';
        };
        
        // Extraire la puissance
        const getPower = () => {
          // Sélecteurs pour la puissance
          const powerSelectors = [
            '[data-testid="vehicle-details-item"]',
            '.VehicleOverview_itemText__AI4dA',
            '.SellerNotesSection_content__te2EB'
          ];
          
          // Parcourir les éléments pour trouver la puissance
          for (const selector of powerSelectors) {
            const elements = document.querySelectorAll(selector);
            if (!elements.length) continue;
            
            for (const el of elements) {
              const text = el.textContent?.trim() || '';
              
              // Format "135 kW (184 CH)" avec espaces
              const fullMatch = text.match(/(\d+)\s*kW\s*\(\s*(\d+)\s*[CP][HV]\s*\)/i);
              if (fullMatch) {
                return `${fullMatch[1]}kW (${fullMatch[2]}CV)`;
              }
              
              // Format "135kW (184CV)" sans espaces
              const compactMatch = text.match(/(\d+)kW\s*\(\s*(\d+)CV\s*\)/i);
              if (compactMatch) {
                return `${compactMatch[1]}kW (${compactMatch[2]}CV)`;
              }
              
              // Format "135 kW" avec ou sans espace
              const kwMatch = text.match(/(\d+)\s*kW/i);
              if (kwMatch) {
                return `${kwMatch[1]}kW`;
              }
              
              // Format "184 CH" ou "184 CV" avec ou sans espace
              const cvMatch = text.match(/(\d+)\s*([CP][HV])/i);
              if (cvMatch) {
                return `${cvMatch[1]}CV`;
              }
            }
          }
          
          // Rechercher spécifiquement dans la description
          const description = document.querySelector('.SellerNotesSection_content__te2EB');
          if (description) {
            const text = description.textContent?.trim() || '';
            
            // Rechercher un motif comme "103KW 140PK" ou "103 kW (140 CV)"
            const kwCvMatch = text.match(/(\d+)\s*kW\s*[\(\s]*(\d+)\s*[CP][HV]/i);
            if (kwCvMatch) {
              return `${kwCvMatch[1]}kW (${kwCvMatch[2]}CV)`;
            }
          }
          
          return '';
        };
        
        // Fonction pour extraire le titre - version optimisée
        const getTitle = () => {
          // Sélecteurs par ordre de priorité, du plus spécifique au plus général
          const titleSelectors = ['[data-testid="title"]', 'h1'];
          
          for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element?.textContent) {
              return element.textContent.trim();
            }
          }
          return '';
        };
        
        // Extraire le prix - version optimisée
        const getPrice = () => {
          // Sélecteurs prioritaires pour le prix
          const priceSelectors = [
            '[data-testid="price-label"] [data-testid="price-label__value"]',
            '[data-testid="price"]',
            'h2[class*="Price"]',
            '.cldt-price',
            '.PriceInfo_price__XU0aF'
          ];
          
          // Fonction pour extraire le prix d'un texte - uniquement la valeur numérique
          const extractPrice = (text: string): number => {
            // Supprimer d'abord tout contenu des balises <sup>
            const textWithoutSup = text.replace(/<sup[^>]*>.*?<\/sup>/g, '');
            
            // Nettoyer le texte pour ne garder que les chiffres, points, virgules et espaces
            const cleanText = textWithoutSup.replace(/[^0-9.,\s]/g, '');
            
            // Normaliser le format (supprimer espaces, remplacer virgules par points)
            const normalized = cleanText.replace(/\s+/g, '').replace(/,/g, '.');
            
            // Extraire le nombre
            const match = normalized.match(/(\d+(?:\.\d+)?)/); 
            
            if (match?.[1]) {
              return Math.round(parseFloat(match[1]));
            }
            return 0;
          };
          
          // Rechercher dans les éléments sélectionnés
          for (const selector of priceSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              // Créer une copie de l'élément pour manipuler son contenu
              const elementClone = element.cloneNode(true) as HTMLElement;
              
              // Supprimer tous les éléments sup
              const supElements = elementClone.querySelectorAll('sup');
              supElements.forEach(sup => sup.remove());
              
              // Extraire le texte sans les éléments sup
              const textWithoutSup = elementClone.textContent?.trim() || '';
              const price = extractPrice(textWithoutSup);
              if (price > 0) return price;
            }
          }
          
          // Rechercher dans le titre de la page si contient le symbole €
          const title = document.title;
          if (title?.includes('€')) {
            const price = extractPrice(title);
            if (price > 0) return price;
          }
          
          return 0;
        };
        
        // Extraire le kilométrage et l'année - version optimisée
        const getBasicInfo = () => {
          // Sélecteurs prioritaires pour les informations de base
          const infoSelectors = [
            '[data-testid="key-facts-list"] [data-testid^="key-fact"]',
            '[data-testid="vehicle-details"] [data-testid="vehicle-details-item"]',
            '[data-testid="basics"] li',
            ".VehicleOverview_itemText__AI4dA"
          ];
          
          let year = 0;
          let mileage = 0;
          let dateStr = ''; // Pour stocker la date au format MM/YYYY
          
          // Extraire l'année du titre de la page (méthode la plus fiable)
          const title = document.title;
          const titleYearMatch = title?.match(/\b(20|19)\d{2}\b/);
          if (titleYearMatch) {
            year = parseInt(titleYearMatch[0]);
          }
          
          // Parcourir les éléments pour trouver le kilométrage et l'année si non trouvée
          for (const selector of infoSelectors) {
            const elements = document.querySelectorAll(selector);
            if (!elements.length) continue;
            
            for (const el of elements) {
              const text = el.textContent?.trim() || '';
              
              // Recherche de la date au format MM/YYYY
              if (!dateStr) {
                const mmYYYYMatch = text.match(/(\d{1,2})\/(20\d{2}|19\d{2})/);
                if (mmYYYYMatch && mmYYYYMatch[0]) {
                  dateStr = mmYYYYMatch[0]; // Stocke la date complète (ex: "12/2018")
                  year = parseInt(mmYYYYMatch[2]); // Extrait aussi l'année pour la compatibilité
                }
              }
              
              // Si pas de format MM/YYYY, chercher juste l'année
              if (!year && !dateStr) {
                const yearMatch = text.match(/\b(20|19)\d{2}\b/);
                if (yearMatch) {
                  year = parseInt(yearMatch[0]);
                }
              }
              
              // Recherche du kilométrage
              if (!mileage && (text.includes('km') || text.toLowerCase().includes('kilom'))) {
                // D'abord supprimer tous les espaces pour traiter les formats comme "39 317 km"
                const textWithoutSpaces = text.replace(/\s+/g, '');
                
                // Chercher le motif numérique suivi de "km"
                const mileageMatch = textWithoutSpaces.match(/(\d+[\.,]?\d*)km/i);
                
                if (mileageMatch) {
                  // Supprimer les séparateurs de milliers (points ou virgules)
                  const cleanMileage = mileageMatch[1].replace(/[\.,]/g, '');
                  mileage = parseInt(cleanMileage);
                }
              }
              
              // Si on a trouvé les deux informations, on peut sortir
              if (year && mileage) break;
            }
            
            if (year && mileage) break;
          }
          
          return { year, mileage, dateStr };
        };
        
        // Extraire la description - version optimisée
        const getDescription = () => {
          // Sélecteurs prioritaires pour la description
          const descriptionSelectors = [
            // Cibler spécifiquement la section des notes du vendeur
            '.SellerNotesSection_content__te2EB',
            '[data-testid="description"]',
            '[data-testid="vehicle-description"]',
            'div[class*="Description_description"]'
          ];
          
          // Rechercher la description principale
          for (const selector of descriptionSelectors) {
            const element = document.querySelector(selector);
            if (element?.textContent) {
              // Nettoyer la description en remplaçant les balises <br> par des sauts de ligne
              // et en supprimant les balises HTML
              const htmlContent = element.innerHTML;
              const textContent = htmlContent
                .replace(/<br\s*\/?>/gi, '\n') // Remplacer <br> par des sauts de ligne
                .replace(/<\/?[^>]+(>|$)/g, ''); // Supprimer les autres balises HTML
              
              return textContent.trim();
            }
          }
          
          // Si aucune description n'est trouvée, utiliser l'équipement
          const equipmentSelector = '[data-testid="equipment-list"] li';
          const equipmentElements = document.querySelectorAll(equipmentSelector);
          
          if (equipmentElements.length > 0) {
            const equipmentList = Array.from(equipmentElements)
              .map(el => el.textContent?.trim())
              .filter(Boolean)
              // Limiter à 10 équipements pour éviter une description trop longue
              .slice(0, 10);
              
            if (equipmentList.length > 0) {
              return 'Équipement: ' + equipmentList.join(', ');
            }
          }
          
          return '';
        };
        
        // Extraire les informations du vendeur - version optimisée
        const getSellerInfo = () => {
          // Fonction utilitaire pour extraire du texte avec plusieurs sélecteurs
          const getTextFromSelectors = (selectors: string[]) => {
            for (const selector of selectors) {
              const element = document.querySelector(selector);
              if (element?.textContent) {
                return element.textContent.trim();
              }
            }
            return '';
          };
          
          // Sélecteurs prioritaires pour chaque information
          const name = getTextFromSelectors([
            '[data-testid="seller-name"]',
            '.cldt-vendor-name'
          ]);
          
          const phone = getTextFromSelectors([
            '[data-testid="seller-phone"]',
            'a[href^="tel:"]'
          ]);
          
          const address = getTextFromSelectors([
            '[data-testid="seller-address"]',
            '.cldt-vendor-address'
          ]);
          
          return { name, phone, address };
        };
        
        // Fonction pour extraire l'image principale - version optimisée
        const getMainImage = () => {
          // Sélecteurs prioritaires pour l'image principale
          const imageSelectors = [
            '[data-testid="gallery"] img',
            '.image-gallery-slide.center img',
            '.image-gallery-image'
          ];
          
          // Vérifier d'abord les métadonnées (souvent la meilleure qualité)
          const metaImage = document.querySelector('meta[property="og:image"]');
          if (metaImage) {
            const content = metaImage.getAttribute('content');
            if (content) return content;
          }
          
          // Sinon chercher dans les sélecteurs d'images
          for (const selector of imageSelectors) {
            const element = document.querySelector(selector);
            const imageUrl = getImageUrl(element);
            if (imageUrl) return imageUrl;
          }
          
          return '';
        };

        // Récupérer toutes les données
        const title = getTitle();
        const titleParts = title.split(' ');
        const make = titleParts[0] || '';
        const model = title.replace(make, '').trim();
        const { year, mileage, dateStr } = getBasicInfo();
        const price = getPrice();
        const description = getDescription();
        const sellerInfo = getSellerInfo();
        const imageUrl = getMainImage();
        const fuel = getFuel();
        const transmission = getTransmission();
        const power = getPower();
        
        // Extraire l'ID unique de l'annonce à partir de l'URL
        const pageUrl = window.location.href;
        const urlIdMatch = pageUrl.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
        const adId = urlIdMatch ? urlIdMatch[1] : '';
        
        // Séparer le nom en prénom et nom de famille
        let firstName = '';
        let lastName = '';
        
        if (sellerInfo.name) {
          const nameParts = sellerInfo.name.split(' ');
          if (nameParts.length > 1) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          } else {
            lastName = sellerInfo.name;
          }
        }
        
        return {
          vehicle: {
            make,
            model,
            year,
            mileage,
            price,
            description,
            imageUrl,
            adId, // Ajout de l'ID unique de l'annonce
            source: 'autoscout24',
            sourceUrl: pageUrl,
            fuel,
            transmission,
            power,
            dateStr // Ajout de la date au format MM/YYYY
          },
          seller: {
            firstName,
            lastName,
            phone: sellerInfo.phone,
            address: sellerInfo.address,
          },
          pageTitle: document.title,
        };
      });
      
      await browser.close();
      
      return NextResponse.json({
        success: true,
        data: vehicleData,
        source: url,
        timestamp: new Date().toISOString(), // Ajout d'un timestamp pour traçabilité
      }, { status: 200 });
      
    } catch (error) {
      console.error('Erreur lors de l\'extraction des données avec Playwright:', error);
      await browser.close();
      return NextResponse.json(
        { error: 'Impossible d\'extraire les données de l\'annonce. Veuillez vérifier l\'URL ou réessayer plus tard.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande.' },
      { status: 500 }
    );
  }
}
