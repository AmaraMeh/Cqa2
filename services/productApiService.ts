// OpenFoodFacts API integration for real product data
export interface ProductApiData {
  name: string;
  brand: string;
  category: string;
  barcode: string;
  imageUrl?: string;
  ingredients?: string[];
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    salt?: number;
  };
  nutritionGrade: string; // A, B, C, D, E
  ecoScore: string; // A, B, C, D, E
  safetyScore: number; // 1-5
  riskFactors: string[];
  expiryDate: Date;
  quantity: number;
  location: string;
  status: 'fresh' | 'warning' | 'expired';
}

// Mock database for demonstration - in production this would be OpenFoodFacts API
const mockProductDatabase: { [key: string]: Omit<ProductApiData, 'expiryDate' | 'quantity' | 'location' | 'status'> } = {
  '3033710074617': {
    name: 'Lait UHT Demi-écrémé',
    brand: 'Candia',
    category: 'Produits laitiers',
    barcode: '3033710074617',
    imageUrl: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
    ingredients: ['Lait demi-écrémé', 'Vitamines A et D'],
    allergens: ['Lait'],
    nutritionalInfo: {
      calories: 46,
      protein: 3.2,
      carbs: 4.8,
      fat: 1.5,
      fiber: 0,
      sugar: 4.8,
      salt: 0.1,
    },
    nutritionGrade: 'B',
    ecoScore: 'C',
    safetyScore: 4,
    riskFactors: [],
  },
  '3017620422003': {
    name: 'Yaourt Nature',
    brand: 'Danone',
    category: 'Produits laitiers',
    barcode: '3017620422003',
    imageUrl: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg',
    ingredients: ['Lait entier', 'Ferments lactiques'],
    allergens: ['Lait'],
    nutritionalInfo: {
      calories: 60,
      protein: 4.5,
      carbs: 6.0,
      fat: 1.2,
      fiber: 0,
      sugar: 6.0,
      salt: 0.1,
    },
    nutritionGrade: 'A',
    ecoScore: 'B',
    safetyScore: 5,
    riskFactors: [],
  },
  '3274080005003': {
    name: 'Pain de mie complet',
    brand: 'Harry\'s',
    category: 'Boulangerie',
    barcode: '3274080005003',
    imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    ingredients: ['Farine de blé complète', 'Eau', 'Levure', 'Sel', 'Sucre', 'Huile de tournesol'],
    allergens: ['Gluten', 'Peut contenir des traces de soja, lait, œufs, graines de sésame'],
    nutritionalInfo: {
      calories: 247,
      protein: 8.5,
      carbs: 41.0,
      fat: 4.2,
      fiber: 6.0,
      sugar: 3.0,
      salt: 1.2,
    },
    nutritionGrade: 'B',
    ecoScore: 'C',
    safetyScore: 4,
    riskFactors: ['Additifs conservateurs'],
  },
  '3560070462926': {
    name: 'Pommes Golden',
    brand: 'Bio Village',
    category: 'Fruits et légumes',
    barcode: '3560070462926',
    imageUrl: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
    ingredients: ['Pommes Golden biologiques'],
    allergens: [],
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbs: 14.0,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      salt: 0.001,
    },
    nutritionGrade: 'A',
    ecoScore: 'A',
    safetyScore: 3,
    riskFactors: ['Résidus de pesticides détectés'],
  },
  '8712566441174': {
    name: 'Céréales Choco Pops',
    brand: 'Kellogg\'s',
    category: 'Petit-déjeuner',
    barcode: '8712566441174',
    imageUrl: 'https://images.pexels.com/photos/5946071/pexels-photo-5946071.jpeg',
    ingredients: ['Riz', 'Sucre', 'Cacao en poudre', 'Sel', 'Arôme de malt d\'orge', 'Vitamines et minéraux'],
    allergens: ['Gluten', 'Peut contenir du lait'],
    nutritionalInfo: {
      calories: 375,
      protein: 4.2,
      carbs: 84.0,
      fat: 1.5,
      fiber: 2.0,
      sugar: 35.0,
      salt: 0.9,
    },
    nutritionGrade: 'D',
    ecoScore: 'D',
    safetyScore: 2,
    riskFactors: ['Taux de sucre élevé', 'Additifs artificiels', 'Ultra-transformé'],
  }
};

// Allergen mapping from English to French
const allergenMapping: { [key: string]: string } = {
  'milk': 'Lait',
  'eggs': 'Œufs',
  'fish': 'Poisson',
  'crustaceans': 'Crustacés',
  'tree-nuts': 'Fruits à coque',
  'peanuts': 'Arachides',
  'soybeans': 'Soja',
  'gluten': 'Gluten',
  'celery': 'Céleri',
  'mustard': 'Moutarde',
  'sesame-seeds': 'Graines de sésame',
  'sulphur-dioxide-and-sulphites': 'Sulfites',
  'lupin': 'Lupin',
  'molluscs': 'Mollusques'
};

// Category-based expiry estimation
const categoryExpiryDays: { [key: string]: number } = {
  'Produits laitiers': 7,
  'Viande': 3,
  'Poisson': 2,
  'Fruits et légumes': 5,
  'Boulangerie': 3,
  'Conserves': 365,
  'Surgelés': 90,
  'Petit-déjeuner': 180,
  'Boissons': 30,
  'Épicerie': 365
};

class ProductApiService {
  private baseUrl = 'https://world.openfoodfacts.org/api/v0/product';

  async getProductByBarcode(barcode: string): Promise<ProductApiData | null> {
    try {
      // First try mock database for demo
      const mockProduct = mockProductDatabase[barcode];
      if (mockProduct) {
        return this.enrichProductData(mockProduct);
      }

      // Try OpenFoodFacts API
      const response = await fetch(`${this.baseUrl}/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        return this.parseOpenFoodFactsData(data.product, barcode);
      }

      return null;
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  }

  private enrichProductData(product: any): ProductApiData {
    const expiryDays = categoryExpiryDays[product.category] || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    return {
      ...product,
      expiryDate,
      quantity: 1,
      location: '',
      status: 'fresh' as const,
    };
  }

  private parseOpenFoodFactsData(product: any, barcode: string): ProductApiData {
    // Extract allergens and map to French
    const allergens: string[] = [];
    if (product.allergens_tags) {
      product.allergens_tags.forEach((allergen: string) => {
        const cleanAllergen = allergen.replace('en:', '');
        if (allergenMapping[cleanAllergen]) {
          allergens.push(allergenMapping[cleanAllergen]);
        }
      });
    }

    // Calculate safety score based on various factors
    let safetyScore = 5;
    if (product.additives_tags && product.additives_tags.length > 5) safetyScore -= 1;
    if (product.nova_group && product.nova_group > 3) safetyScore -= 1;
    if (allergens.length > 3) safetyScore -= 1;

    // Identify risk factors
    const riskFactors: string[] = [];
    if (product.nova_group === 4) riskFactors.push('Aliment ultra-transformé');
    if (product.additives_tags && product.additives_tags.length > 10) {
      riskFactors.push('Nombreux additifs');
    }
    if (product.nutrient_levels) {
      if (product.nutrient_levels.salt === 'high') riskFactors.push('Taux de sel élevé');
      if (product.nutrient_levels.sugars === 'high') riskFactors.push('Taux de sucre élevé');
      if (product.nutrient_levels.fat === 'high') riskFactors.push('Taux de matières grasses élevé');
    }

    // Estimate expiry date based on category
    const category = product.categories_tags?.[0]?.replace('en:', '') || 'Épicerie';
    const categoryFr = this.translateCategory(category);
    const expiryDays = categoryExpiryDays[categoryFr] || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    return {
      name: product.product_name || 'Produit inconnu',
      brand: product.brands || '',
      category: categoryFr,
      barcode,
      imageUrl: product.image_url,
      ingredients: product.ingredients_text ? product.ingredients_text.split(', ') : [],
      allergens,
      nutritionalInfo: {
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.nutriments?.proteins_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        fat: product.nutriments?.fat_100g || 0,
        fiber: product.nutriments?.fiber_100g || 0,
        sugar: product.nutriments?.sugars_100g || 0,
        salt: product.nutriments?.salt_100g || 0,
      },
      nutritionGrade: (product.nutrition_grades || 'c').toUpperCase(),
      ecoScore: (product.ecoscore_grade || 'c').toUpperCase(),
      safetyScore: Math.max(1, Math.min(5, safetyScore)),
      riskFactors,
      expiryDate,
      quantity: 1,
      location: '',
      status: 'fresh',
    };
  }

  private translateCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'dairy': 'Produits laitiers',
      'meat': 'Viande',
      'fish': 'Poisson',
      'fruits': 'Fruits et légumes',
      'vegetables': 'Fruits et légumes',
      'bread': 'Boulangerie',
      'beverages': 'Boissons',
      'breakfast': 'Petit-déjeuner',
      'cereals': 'Petit-déjeuner',
      'canned': 'Conserves',
      'frozen': 'Surgelés'
    };

    for (const [en, fr] of Object.entries(categoryMap)) {
      if (category.toLowerCase().includes(en)) {
        return fr;
      }
    }

    return 'Épicerie';
  }

  // Search products by name or brand
  async searchProducts(query: string, page: number = 1): Promise<ProductApiData[]> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=20&json=true`
      );
      const data = await response.json();

      if (data.products) {
        return data.products.map((product: any) => 
          this.parseOpenFoodFactsData(product, product.code)
        );
      }

      return [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

export const productApiService = new ProductApiService();