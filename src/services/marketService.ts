import { MarketPrice } from '../types';
import { mockMarketPrices } from '../data/mockData';

export class MarketService {
  private readonly apiKey: string = (import.meta as any)?.env?.VITE_MARKET_API_KEY || '579b464db66ec23bdd0000012961ac8a5fab4b7b61fd1ef6e09641ea';
  private readonly baseUrl: string = (import.meta as any)?.env?.VITE_MARKET_API_BASE || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  private marketPrices: MarketPrice[] = mockMarketPrices;
  private readonly apiKey: string = '579b464db66ec23bdd0000012961ac8a5fab4b7b61fd1ef6e09641ea';
  private readonly baseUrl: string = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  /**
   * Fetch latest market prices from data.gov.in API and update cache
   */
  async fetchLivePrices(limit: number = 50, state?: string, commodity?: string): Promise<MarketPrice[]> {
    try {
      const params: string[] = [
        `api-key=${encodeURIComponent(this.apiKey)}`,
        `format=json`,
        `limit=${encodeURIComponent(String(limit))}`
      ];
      if (state && state.toLowerCase() !== 'all') {
        params.push(`filters[state]=${encodeURIComponent(state)}`);
      }
      if (commodity && commodity.toLowerCase() !== 'all') {
        params.push(`filters[commodity]=${encodeURIComponent(commodity)}`);
      }
      const url = `${this.baseUrl}?${params.join('&')}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const records = Array.isArray(data?.records) ? data.records : [];

      const mapped: MarketPrice[] = records.map((r: any) => {
        const commodity: string = r?.commodity || 'Unknown';
        const locationStr: string = [r?.market, r?.district, r?.state].filter(Boolean).join(', ');
        const modalPriceNum = Number(r?.modal_price);
        const minPriceNum = Number(r?.min_price);
        const maxPriceNum = Number(r?.max_price);
        const price = isFinite(modalPriceNum) && modalPriceNum > 0
          ? modalPriceNum
          : isFinite(minPriceNum) && isFinite(maxPriceNum)
            ? Math.round(((minPriceNum + maxPriceNum) / 2) * 100) / 100
            : 0;
        const unit: 'kg' | 'quintal' | 'tonne' = 'quintal';

        // Heuristic trend based on modal vs avg(min,max)
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (isFinite(minPriceNum) && isFinite(maxPriceNum) && isFinite(modalPriceNum)) {
          const avg = (minPriceNum + maxPriceNum) / 2;
          const diff = modalPriceNum - avg;
          if (diff > avg * 0.03) trend = 'up';
          else if (diff < -avg * 0.03) trend = 'down';
        }

        // Parse date dd/mm/yyyy
        let date = new Date();
        const dateStr: string = r?.arrival_date;
        if (typeof dateStr === 'string') {
          const parts = dateStr.replace(/\./g, '/').split(/[\/]/);
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts.map(p => parseInt(p, 10));
            if (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy)) {
              date = new Date(yyyy, mm - 1, dd);
            }
          }
        }

        return {
          cropId: commodity.toLowerCase().replace(/\s+/g, '-'),
          cropName: commodity,
          price,
          unit,
          location: locationStr || 'N/A',
          date,
          trend
        } as MarketPrice;
      });

      if (mapped.length > 0) {
        this.marketPrices = mapped;
        return mapped;
      }
      // If API returned empty, keep existing cache and return it
      return this.marketPrices;
    } catch (error) {
      console.error('Failed to fetch live market prices:', error);
      return this.marketPrices;
    }
  }

  /**
   * Get current market prices for all crops
   */
  getAllMarketPrices(): MarketPrice[] {
    return this.marketPrices;
  }

  /**
   * Try to fetch live prices from a remote API. Falls back to mock data on any error.
   */
  async fetchLivePrices(limit: number = 100, state?: string, crop?: string): Promise<MarketPrice[]> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('api-key', this.apiKey);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', String(limit));
      if (state && state !== 'all') url.searchParams.set('filters[state]', state);
      if (crop) url.searchParams.set('filters[commodity]', crop);

      const resp = await fetch(url.toString());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const records: any[] = Array.isArray(data.records) ? data.records : [];
      if (records.length === 0) {
        throw new Error('No records from API');
      }

      const parsed: MarketPrice[] = records.map((r: any) => ({
        cropId: String(r.commodity || '').toLowerCase(),
        cropName: String(r.commodity || 'Unknown'),
        price: Number(r.modal_price || r.min_price || r.max_price || 0),
        unit: 'quintal',
        location: [r.market, r.district, r.state].filter(Boolean).join(', '),
        date: new Date(r.arrival_date || Date.now()),
        trend: 'stable'
      }));

      // Simple trend estimation: compare modal vs min/max if present
      parsed.forEach((p, i) => {
        const rec = records[i];
        const min = Number(rec.min_price || p.price);
        const max = Number(rec.max_price || p.price);
        p.trend = p.price > (min + max) / 2 ? 'up' : p.price < (min + max) / 2 ? 'down' : 'stable';
      });

      this.marketPrices = parsed;
      return parsed;
    } catch (err) {
      console.warn('fetchLivePrices failed, using fallback:', err);
      this.marketPrices = mockMarketPrices;
      return this.marketPrices;
    }
  }

  /**
   * Generate price alerts based on current marketPrices
   */
  getPriceAlerts(prices: MarketPrice[] = this.marketPrices): string[] {
    const alerts: string[] = [];
    if (!prices || prices.length === 0) return alerts;

    // High price alerts (top 10%)
    const sorted = [...prices].sort((a, b) => b.price - a.price);
    const top = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.1)));
    top.forEach(p => {
      alerts.push(`${p.cropName} high price at ₹${p.price}/${p.unit} in ${p.location}`);
    });

    // Trend-based alerts
    const upItems = prices.filter(p => p.trend === 'up').slice(0, 3);
    const downItems = prices.filter(p => p.trend === 'down').slice(0, 3);
    if (upItems.length) {
      alerts.push(`Uptrend: ${upItems.map(p => p.cropName).join(', ')}`);
    }
    if (downItems.length) {
      alerts.push(`Downtrend: ${downItems.map(p => p.cropName).join(', ')}`);
    }

    // Location-specific best price
    const byCrop: Record<string, MarketPrice> = {};
    prices.forEach(p => {
      const key = p.cropName.toLowerCase();
      if (!byCrop[key] || p.price > byCrop[key].price) byCrop[key] = p;
    });
    const best = Object.values(byCrop).slice(0, 3);
    best.forEach(p => alerts.push(`Best ${p.cropName} price in ${p.location}: ₹${p.price}/${p.unit}`));

    return Array.from(new Set(alerts)).slice(0, 8);
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
