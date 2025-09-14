import { MarketPrice, Location } from '../types';
import { mockMarketPrices } from '../data/mockData';

export class MarketService {
  private marketPrices: MarketPrice[] = mockMarketPrices;

  /**
   * Get current market prices for all crops
   */
  getAllMarketPrices(): MarketPrice[] {
    return this.marketPrices;
  }

  /**
   * Get market prices filtered by location
   */
  getMarketPricesByLocation(location: string): MarketPrice[] {
    return this.marketPrices.filter(price => 
      price.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Get market prices for a specific crop
   */
  getMarketPricesByCrop(cropId: string): MarketPrice[] {
    return this.marketPrices.filter(price => price.cropId === cropId);
  }

  /**
   * Get price trends for a crop over time
   */
  getPriceTrends(cropId: string, days: number = 30): MarketPrice[] {
    // In a real implementation, this would fetch historical data
    // For now, we'll return mock data with simulated trends
    const cropPrices = this.getMarketPricesByCrop(cropId);
    const trends: MarketPrice[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const basePrice = cropPrices[0]?.price || 0;
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation);
      
      trends.push({
        cropId,
        cropName: cropPrices[0]?.cropName || '',
        price: Math.round(price * 100) / 100,
        unit: cropPrices[0]?.unit || 'kg',
        location: cropPrices[0]?.location || '',
        date,
        trend: variation > 0.02 ? 'up' : variation < -0.02 ? 'down' : 'stable'
      });
    }
    
    return trends;
  }

  /**
   * Get best selling locations for a crop
   */
  getBestSellingLocations(cropId: string): { location: string; price: number; demand: number }[] {
    const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
    const cropPrices = this.getMarketPricesByCrop(cropId);
    const basePrice = cropPrices[0]?.price || 0;
    
    return locations.map(location => ({
      location,
      price: basePrice * (0.8 + Math.random() * 0.4), // ±20% variation
      demand: Math.floor(Math.random() * 100) + 50 // 50-150 demand score
    })).sort((a, b) => b.price - a.price);
  }

  /**
   * Get demand forecast for crops
   */
  getDemandForecast(cropId: string): { period: string; demand: number; trend: 'up' | 'down' | 'stable' }[] {
    const periods = ['Next Week', 'Next Month', 'Next Quarter', 'Next Year'];
    const baseDemand = 75; // Base demand score
    
    return periods.map(period => {
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const demand = Math.max(0, Math.min(100, baseDemand + variation * 100));
      
      return {
        period,
        demand: Math.round(demand),
        trend: variation > 0.05 ? 'up' : variation < -0.05 ? 'down' : 'stable'
      };
    });
  }

  /**
   * Get market insights and recommendations
   */
  getMarketInsights(): { title: string; description: string; type: 'price' | 'demand' | 'supply' }[] {
    return [
      {
        title: 'Rice Price Surge',
        description: 'Rice prices are trending upward due to increased demand from urban markets and export opportunities.',
        type: 'price'
      },
      {
        title: 'Wheat Demand Increase',
        description: 'Wheat demand expected to increase in next quarter due to festival season and government procurement.',
        type: 'demand'
      },
      {
        title: 'Cotton Supply Shortage',
        description: 'Cotton supply is expected to be tight this season, leading to higher prices.',
        type: 'supply'
      },
      {
        title: 'Best Selling Locations',
        description: 'Delhi and Mumbai offer the highest prices for most crops due to high demand and purchasing power.',
        type: 'price'
      }
    ];
  }

  /**
   * Calculate profit potential for a crop
   */
  calculateProfitPotential(
    cropId: string,
    farmSize: number,
    expectedYield: number,
    productionCost: number
  ): { profit: number; roi: number; recommendation: string } {
    const cropPrices = this.getMarketPricesByCrop(cropId);
    const marketPrice = cropPrices[0]?.price || 0;
    
    const totalRevenue = marketPrice * expectedYield * farmSize;
    const totalCost = productionCost * farmSize;
    const profit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    
    let recommendation = '';
    if (roi > 50) {
      recommendation = 'Excellent profit potential - Highly recommended';
    } else if (roi > 25) {
      recommendation = 'Good profit potential - Recommended';
    } else if (roi > 10) {
      recommendation = 'Moderate profit potential - Consider carefully';
    } else {
      recommendation = 'Low profit potential - Not recommended';
    }
    
    return {
      profit: Math.round(profit),
      roi: Math.round(roi * 100) / 100,
      recommendation
    };
  }

  /**
   * Get contract farming opportunities
   */
  getContractFarmingOpportunities(): {
    company: string;
    crop: string;
    contractPrice: number;
    duration: string;
    requirements: string[];
    benefits: string[];
  }[] {
    return [
      {
        company: 'ITC Limited',
        crop: 'Rice',
        contractPrice: 28,
        duration: '6 months',
        requirements: ['Minimum 5 acres', 'Organic farming practices', 'Quality certification'],
        benefits: ['Guaranteed price', 'Technical support', 'Input supply', 'Insurance coverage']
      },
      {
        company: 'Reliance Fresh',
        crop: 'Vegetables',
        contractPrice: 35,
        duration: '3 months',
        requirements: ['Minimum 2 acres', 'Greenhouse farming', 'Quality standards'],
        benefits: ['Direct market access', 'Fair pricing', 'Logistics support']
      },
      {
        company: 'Mahindra Agri Solutions',
        crop: 'Cotton',
        contractPrice: 85,
        duration: '8 months',
        requirements: ['Minimum 10 acres', 'Modern farming techniques', 'Quality control'],
        benefits: ['Premium pricing', 'Technology support', 'Training programs']
      }
    ];
  }
}
