import { MarketPrice } from '../types';
import { mockMarketPrices } from '../data/mockData';

export class MarketService {
  private readonly apiKey: string = (import.meta as any)?.env?.VITE_MARKET_API_KEY || '579b464db66ec23bdd0000012961ac8a5fab4b7b61fd1ef6e09641ea';
  private readonly baseUrl: string = (import.meta as any)?.env?.VITE_MARKET_API_BASE || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  private marketPrices: MarketPrice[] = mockMarketPrices;

  /**
   * Fetch latest market prices from data.gov.in API and update cache
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
        };
      });

      // Simple trend estimation: compare modal vs min/max if present
      mapped.forEach((p, i) => {
        const rec = records[i];
        const min = Number(rec.min_price || p.price);
        const max = Number(rec.max_price || p.price);
        p.trend = p.price > (min + max) / 2 ? 'up' : p.price < (min + max) / 2 ? 'down' : 'stable';
      });

      this.marketPrices = mapped;
      return mapped;
    } catch (err) {
      console.warn('fetchLivePrices failed, using fallback:', err);
      this.marketPrices = mockMarketPrices;
      return this.marketPrices;
    }
  }
  // Add more methods as needed
}
