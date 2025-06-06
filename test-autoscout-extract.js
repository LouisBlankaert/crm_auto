// Script de test pour l'API d'extraction AutoScout24
// Utilisez une URL réelle d'AutoScout24 pour tester
const testUrl = 'https://www.autoscout24.fr/offres/volkswagen-golf-2-0-tdi-150-dsg7-r-line-diesel-gris-c7f1c0f7-9c7b-4f5e-9d5f-f2e9a0e9c7f1';

async function testAutoScoutExtractAPI() {
  try {
    console.log('Envoi de la requête à l\'API avec l\'URL:', testUrl);
    
    const response = await fetch('http://localhost:3000/api/autoscout-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl }),
    });
    
    const data = await response.json();
    console.log('Résultat de l\'API:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erreur lors du test de l\'API:', error);
  }
}

// Exécuter le test
testAutoScoutExtractAPI();
