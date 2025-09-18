import { DetectionRecord, DetectionResult } from '../types';

export class PestDetectionService {
  private readonly STORAGE_KEY = 'krishimitra_detection_history_v1';

  async detectFromFile(file: File, userId?: string, cropType?: string): Promise<DetectionRecord> {
    const imageUrl = URL.createObjectURL(file);
    const result = await this.runMockModel(imageUrl, cropType);
    const record: DetectionRecord = {
      id: this.generateId(),
      userId,
      imageUrl,
      cropType,
      createdAt: new Date(),
      result
    };
    this.saveRecord(record);
    return record;
  }

  getHistory(userId?: string): DetectionRecord[] {
    const all = this.getStored();
    return userId ? all.filter(r => r.userId === userId) : all;
  }

  private async runMockModel(imageUrl: string, cropType?: string): Promise<DetectionResult> {
    // Simple mock: choose from a few labels with deterministic randomness
    const labels = [
      {
        canonical: 'tomato_early_blight',
        display: 'Tomato Early Blight',
        category: 'disease' as const,
        scientificName: 'Alternaria solani',
        prevention: [
          'Use resistant varieties',
          'Rotate crops and remove debris'
        ],
        treatment: [
          'Apply chlorothalonil or mancozeb',
          'Improve air circulation'
        ]
      },
      {
        canonical: 'rice_stem_borer',
        display: 'Rice Stem Borer',
        category: 'pest' as const,
        scientificName: 'Scirpophaga incertulas',
        prevention: [
          'Use pheromone traps',
          'Maintain recommended planting density'
        ],
        treatment: [
          'Release Trichogramma wasps',
          'Apply Carbofuran if severe'
        ]
      },
      {
        canonical: 'nitrogen_deficiency',
        display: 'Nitrogen Deficiency',
        category: 'nutrient_deficiency' as const,
        scientificName: undefined,
        prevention: [
          'Use balanced fertilization',
          'Incorporate legumes in rotation'
        ],
        treatment: [
          'Apply urea or ammonium nitrate',
          'Split applications to reduce losses'
        ]
      }
    ];

    // Deterministic confidence based on URL hash
    const hash = this.hashString(imageUrl + (cropType || ''));
    const idx = hash % labels.length;
    const confidence = 0.65 + (hash % 30) / 100; // 0.65 - 0.94
    const picked = labels[idx];

    const result: DetectionResult = {
      model: 'mock-plantvillage-v1',
      label: picked.canonical,
      displayName: picked.display,
      confidence: Math.min(0.99, confidence),
      category: picked.category,
      pestInfo: {
        scientificName: picked.scientificName,
        overview: `${picked.display} detected based on visual cues.`,
        prevention: picked.prevention,
        treatment: picked.treatment
      }
    };
    // Simulate latency
    await new Promise(r => setTimeout(r, 600));
    return result;
  }

  private hashString(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private getStored(): DetectionRecord[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as any[];
      return parsed.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private saveRecord(record: DetectionRecord): void {
    const all = this.getStored();
    all.unshift(record);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all.slice(0, 100)));
  }

  private generateId(): string {
    return 'detect_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  }
}


