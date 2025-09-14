import { Crop, CropRecommendation, SoilData, WeatherData, Location } from '../types';
import { mockCrops } from '../data/mockData';

export class CropRecommendationService {
  private crops: Crop[] = mockCrops;

  /**
   * Get crop recommendations based on farmer's conditions
   */
  getRecommendations(
    location: Location,
    soilData: SoilData,
    weatherData: WeatherData,
    farmSize: number,
    season: string
  ): CropRecommendation[] {
    const recommendations: CropRecommendation[] = [];

    for (const crop of this.crops) {
      const score = this.calculateCropScore(crop, soilData, weatherData, location, season);
      
      if (score > 0.6) { // Only recommend crops with score > 60%
        const sowingDate = this.calculateSowingDate(crop, weatherData);
        const harvestingDate = new Date(sowingDate.getTime() + crop.duration * 24 * 60 * 60 * 1000);
        const expectedYield = this.calculateExpectedYield(crop, soilData, weatherData);
        const estimatedProfit = expectedYield * crop.marketPrice * farmSize;

        recommendations.push({
          crop,
          score,
          reasons: this.getRecommendationReasons(crop, soilData, weatherData),
          sowingDate,
          harvestingDate,
          expectedYield,
          estimatedProfit
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate crop suitability score (0-1)
   */
  private calculateCropScore(
    crop: Crop,
    soilData: SoilData,
    weatherData: WeatherData,
    location: Location,
    season: string
  ): number {
    let score = 0;
    let factors = 0;

    // Soil type compatibility (30% weight)
    if (crop.soilType.includes(soilData.type)) {
      score += 0.3;
    }
    factors++;

    // Temperature compatibility (25% weight)
    const avgTemp = (weatherData.temperature + weatherData.forecast[0].temperature.max) / 2;
    if (avgTemp >= crop.temperatureRange.min && avgTemp <= crop.temperatureRange.max) {
      score += 0.25;
    }
    factors++;

    // Season compatibility (20% weight)
    if (crop.season === season || crop.season === 'all') {
      score += 0.2;
    }
    factors++;

    // Water requirement vs rainfall (15% weight)
    const rainfall = weatherData.rainfall;
    if (crop.waterRequirement === 'high' && rainfall > 100) {
      score += 0.15;
    } else if (crop.waterRequirement === 'medium' && rainfall > 50) {
      score += 0.15;
    } else if (crop.waterRequirement === 'low' && rainfall < 100) {
      score += 0.15;
    }
    factors++;

    // Market price factor (10% weight)
    if (crop.marketPrice > 20) {
      score += 0.1;
    }
    factors++;

    return score;
  }

  /**
   * Calculate optimal sowing date
   */
  private calculateSowingDate(crop: Crop, weatherData: WeatherData): Date {
    const today = new Date();
    const daysToAdd = crop.season === 'kharif' ? 30 : 60; // Adjust based on season
    return new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  /**
   * Calculate expected yield based on conditions
   */
  private calculateExpectedYield(crop: Crop, soilData: SoilData, weatherData: WeatherData): number {
    let yieldMultiplier = 1;

    // Soil quality impact
    if (soilData.organicMatter > 2) yieldMultiplier *= 1.2;
    if (soilData.ph >= 6 && soilData.ph <= 7.5) yieldMultiplier *= 1.1;

    // Weather impact
    if (weatherData.temperature >= crop.temperatureRange.min && 
        weatherData.temperature <= crop.temperatureRange.max) {
      yieldMultiplier *= 1.1;
    }

    return Math.round(crop.yield * yieldMultiplier);
  }

  /**
   * Get reasons for recommendation
   */
  private getRecommendationReasons(
    crop: Crop,
    soilData: SoilData,
    weatherData: WeatherData
  ): string[] {
    const reasons: string[] = [];

    if (crop.soilType.includes(soilData.type)) {
      reasons.push(`Suitable for ${soilData.type} soil`);
    }

    if (crop.marketPrice > 20) {
      reasons.push('Good market price');
    }

    if (crop.waterRequirement === 'low' && weatherData.rainfall < 100) {
      reasons.push('Low water requirement matches rainfall');
    }

    if (crop.yield > 2000) {
      reasons.push('High yield potential');
    }

    return reasons;
  }

  /**
   * Get all available crops
   */
  getAllCrops(): Crop[] {
    return this.crops;
  }

  /**
   * Get crop by ID
   */
  getCropById(id: string): Crop | undefined {
    return this.crops.find(crop => crop.id === id);
  }
}
