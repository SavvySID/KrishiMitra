import { SoilData, Location } from '../types';

export class SoilService {
  /**
   * Analyze soil health and provide recommendations
   */
  analyzeSoilHealth(soilData: SoilData): {
    overallScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
    improvements: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];
    const improvements: string[] = [];

    // pH Analysis (25% weight)
    if (soilData.ph >= 6.0 && soilData.ph <= 7.5) {
      score += 25;
    } else if (soilData.ph >= 5.5 && soilData.ph <= 8.0) {
      score += 15;
      recommendations.push('pH level is acceptable but not optimal');
    } else {
      score += 5;
      recommendations.push('pH level needs adjustment');
      if (soilData.ph < 6.0) {
        improvements.push('Add lime to increase pH');
      } else {
        improvements.push('Add sulfur or organic matter to decrease pH');
      }
    }

    // Organic Matter Analysis (25% weight)
    if (soilData.organicMatter >= 3.0) {
      score += 25;
    } else if (soilData.organicMatter >= 2.0) {
      score += 20;
    } else if (soilData.organicMatter >= 1.0) {
      score += 10;
      recommendations.push('Organic matter content is low');
      improvements.push('Add compost, manure, or green manure');
    } else {
      score += 5;
      recommendations.push('Organic matter content is very low');
      improvements.push('Urgent: Add organic matter through composting');
    }

    // Nutrient Analysis (30% weight)
    const nutrientScore = this.analyzeNutrients(soilData.nutrients);
    score += nutrientScore;
    
    if (nutrientScore < 20) {
      recommendations.push('Nutrient levels are inadequate');
      improvements.push('Apply balanced NPK fertilizer');
    }

    // Moisture Analysis (20% weight)
    if (soilData.moisture >= 50 && soilData.moisture <= 80) {
      score += 20;
    } else if (soilData.moisture >= 40 && soilData.moisture <= 90) {
      score += 15;
      recommendations.push('Soil moisture needs attention');
    } else {
      score += 5;
      recommendations.push('Soil moisture is problematic');
      if (soilData.moisture < 40) {
        improvements.push('Improve irrigation and water retention');
      } else {
        improvements.push('Improve drainage to prevent waterlogging');
      }
    }

    // Determine health status
    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) {
      healthStatus = 'excellent';
    } else if (score >= 60) {
      healthStatus = 'good';
    } else if (score >= 40) {
      healthStatus = 'fair';
    } else {
      healthStatus = 'poor';
    }

    return {
      overallScore: Math.round(score),
      healthStatus,
      recommendations,
      improvements
    };
  }

  /**
   * Analyze nutrient levels
   */
  private analyzeNutrients(nutrients: { nitrogen: number; phosphorus: number; potassium: number }): number {
    let score = 0;

    // Nitrogen (10% weight)
    if (nutrients.nitrogen >= 40 && nutrients.nitrogen <= 60) {
      score += 10;
    } else if (nutrients.nitrogen >= 30 && nutrients.nitrogen <= 70) {
      score += 7;
    } else {
      score += 3;
    }

    // Phosphorus (10% weight)
    if (nutrients.phosphorus >= 20 && nutrients.phosphorus <= 40) {
      score += 10;
    } else if (nutrients.phosphorus >= 15 && nutrients.phosphorus <= 50) {
      score += 7;
    } else {
      score += 3;
    }

    // Potassium (10% weight)
    if (nutrients.potassium >= 150 && nutrients.potassium <= 250) {
      score += 10;
    } else if (nutrients.potassium >= 120 && nutrients.potassium <= 300) {
      score += 7;
    } else {
      score += 3;
    }

    return score;
  }

  /**
   * Get fertilizer recommendations based on soil analysis
   */
  getFertilizerRecommendations(
    soilData: SoilData,
    cropType: string,
    farmSize: number
  ): {
    fertilizers: { name: string; amount: number; unit: string; timing: string }[];
    totalCost: number;
    applicationSchedule: { date: string; activity: string }[];
  } {
    const recommendations = this.analyzeSoilHealth(soilData);
    const fertilizers: { name: string; amount: number; unit: string; timing: string }[] = [];
    let totalCost = 0;

    // Nitrogen recommendations
    if (soilData.nutrients.nitrogen < 40) {
      const amount = Math.max(0, (50 - soilData.nutrients.nitrogen) * farmSize * 0.1);
      fertilizers.push({
        name: 'Urea (46-0-0)',
        amount: Math.round(amount * 100) / 100,
        unit: 'kg',
        timing: 'Split application - 50% at sowing, 50% at flowering'
      });
      totalCost += amount * 15; // ₹15 per kg
    }

    // Phosphorus recommendations
    if (soilData.nutrients.phosphorus < 20) {
      const amount = Math.max(0, (30 - soilData.nutrients.phosphorus) * farmSize * 0.05);
      fertilizers.push({
        name: 'DAP (18-46-0)',
        amount: Math.round(amount * 100) / 100,
        unit: 'kg',
        timing: 'Basal application at sowing'
      });
      totalCost += amount * 25; // ₹25 per kg
    }

    // Potassium recommendations
    if (soilData.nutrients.potassium < 150) {
      const amount = Math.max(0, (200 - soilData.nutrients.potassium) * farmSize * 0.02);
      fertilizers.push({
        name: 'MOP (0-0-60)',
        amount: Math.round(amount * 100) / 100,
        unit: 'kg',
        timing: 'Basal application at sowing'
      });
      totalCost += amount * 20; // ₹20 per kg
    }

    // Organic matter recommendations
    if (soilData.organicMatter < 2.0) {
      const amount = farmSize * 2; // 2 tons per acre
      fertilizers.push({
        name: 'Farm Yard Manure',
        amount: Math.round(amount * 100) / 100,
        unit: 'tons',
        timing: 'Apply 15-20 days before sowing'
      });
      totalCost += amount * 500; // ₹500 per ton
    }

    // Application schedule
    const applicationSchedule = [
      { date: '15 days before sowing', activity: 'Apply organic manure and prepare soil' },
      { date: 'At sowing', activity: 'Apply basal fertilizers (DAP, MOP)' },
      { date: '25-30 days after sowing', activity: 'First top dressing of urea' },
      { date: '45-50 days after sowing', activity: 'Second top dressing of urea' }
    ];

    return {
      fertilizers,
      totalCost: Math.round(totalCost),
      applicationSchedule
    };
  }

  /**
   * Get soil testing recommendations
   */
  getSoilTestingRecommendations(location: Location): {
    labs: { name: string; location: string; contact: string; cost: number }[];
    parameters: string[];
    frequency: string;
  } {
    const labs = [
      {
        name: 'Soil Testing Laboratory',
        location: 'Agricultural University, ' + location.state,
        contact: '+91-XXX-XXXXXXX',
        cost: 500
      },
      {
        name: 'Krishi Vigyan Kendra',
        location: location.district + ', ' + location.state,
        contact: '+91-XXX-XXXXXXX',
        cost: 300
      },
      {
        name: 'Private Soil Testing Lab',
        location: 'Near ' + location.district,
        contact: '+91-XXX-XXXXXXX',
        cost: 800
      }
    ];

    const parameters = [
      'pH Level',
      'Organic Matter Content',
      'Nitrogen (N)',
      'Phosphorus (P)',
      'Potassium (K)',
      'Micronutrients (Zn, Fe, Mn, Cu)',
      'Soil Texture',
      'Water Holding Capacity'
    ];

    return {
      labs,
      parameters,
      frequency: 'Test soil every 2-3 years or before major crop changes'
    };
  }

  /**
   * Get organic farming recommendations
   */
  getOrganicFarmingRecommendations(soilData: SoilData): {
    practices: string[];
    inputs: { name: string; purpose: string; application: string }[];
    benefits: string[];
  } {
    const practices = [
      'Crop rotation with legumes',
      'Green manuring',
      'Composting',
      'Vermicomposting',
      'Biofertilizer application',
      'Mulching',
      'Cover cropping'
    ];

    const inputs = [
      {
        name: 'Vermicompost',
        purpose: 'Improve soil structure and nutrient content',
        application: '5-10 tons per acre annually'
      },
      {
        name: 'Neem Cake',
        purpose: 'Natural pest control and soil enrichment',
        application: '200-300 kg per acre'
      },
      {
        name: 'Rhizobium Culture',
        purpose: 'Nitrogen fixation in legumes',
        application: 'As per seed treatment'
      },
      {
        name: 'Farm Yard Manure',
        purpose: 'Organic matter and nutrient supply',
        application: '10-15 tons per acre'
      }
    ];

    const benefits = [
      'Improved soil health and fertility',
      'Reduced input costs',
      'Better water retention',
      'Enhanced biodiversity',
      'Premium market prices',
      'Environmental sustainability'
    ];

    return {
      practices,
      inputs,
      benefits
    };
  }

  /**
   * Calculate soil improvement cost
   */
  calculateSoilImprovementCost(
    soilData: SoilData,
    farmSize: number,
    improvementType: 'basic' | 'moderate' | 'comprehensive'
  ): { cost: number; timeline: string; expectedImprovement: string } {
    let cost = 0;
    let timeline = '';
    let expectedImprovement = '';

    switch (improvementType) {
      case 'basic':
        cost = farmSize * 2000; // ₹2000 per acre
        timeline = '6-12 months';
        expectedImprovement = '10-15% improvement in soil health';
        break;
      case 'moderate':
        cost = farmSize * 5000; // ₹5000 per acre
        timeline = '12-18 months';
        expectedImprovement = '25-30% improvement in soil health';
        break;
      case 'comprehensive':
        cost = farmSize * 10000; // ₹10000 per acre
        timeline = '18-24 months';
        expectedImprovement = '40-50% improvement in soil health';
        break;
    }

    return {
      cost: Math.round(cost),
      timeline,
      expectedImprovement
    };
  }
}
