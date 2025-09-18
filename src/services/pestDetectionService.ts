import { DetectionRecord, DetectionResult } from '../types';

export class PestDetectionService {
  private readonly STORAGE_KEY = 'krishimitra_detection_history_v1';

  async detectFromFile(file: File, userId?: string, cropType?: string): Promise<DetectionRecord> {
    const imageUrl = URL.createObjectURL(file);
    const result = await this.analyzePlantImage(file, cropType);
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

  private async analyzePlantImage(file: File, cropType?: string): Promise<DetectionResult> {
    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not configured');
      }

      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      const mimeType = this.getMimeType(file.type);

      // Prepare the image data for the API
      const imageParts = [
        {
          inlineData: {
            data: base64,
            mimeType: mimeType,
          },
        },
      ];

      // Define the prompt for plant disease/pest detection
      const prompt = `
        You are an agricultural expert specializing in plant disease and pest identification. 
        Analyze the plant image and provide a detailed assessment.
        
        ${cropType ? `The crop type is: ${cropType}` : ''}
        
        Please provide your analysis in the following JSON format:
        {
          "canonical": "disease_or_pest_identifier",
          "displayName": "Human readable name",
          "category": "disease" or "pest" or "nutrient_deficiency" or "healthy",
          "confidence": 0.85,
          "scientificName": "Scientific name if applicable",
          "overview": "Brief description of the condition",
          "prevention": ["Prevention method 1", "Prevention method 2"],
          "treatment": ["Treatment method 1", "Treatment method 2"]
        }
        
        Focus on:
        1. Identifying any diseases, pests, or nutrient deficiencies
        2. If the plant appears healthy, indicate that
        3. Provide practical, actionable advice for farmers
        4. Use simple language that farmers can understand
        5. Include both prevention and treatment strategies
      `;

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                ...imageParts
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to parse JSON response
      let analysis;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Fallback to mock data if parsing fails
        console.warn('Failed to parse Gemini response, using fallback:', parseError);
        return this.getFallbackResult();
      }

      const result: DetectionResult = {
        model: 'gemini-1.5-flash',
        label: analysis.canonical || 'unknown',
        displayName: analysis.displayName || 'Unknown Condition',
        confidence: Math.min(0.99, Math.max(0.1, analysis.confidence || 0.5)),
        category: analysis.category || 'unknown',
        pestInfo: {
          scientificName: analysis.scientificName,
          overview: analysis.overview || 'Analysis completed',
          prevention: analysis.prevention || [],
          treatment: analysis.treatment || []
        }
      };

      return result;

    } catch (error) {
      console.error('Error analyzing plant image:', error);
      // Return fallback result on error
      return this.getFallbackResult();
    }
  }

  private getFallbackResult(): DetectionResult {
    return {
      model: 'fallback-mock',
      label: 'healthy_plant',
      displayName: 'Plant appears healthy',
      confidence: 0.5,
      category: 'healthy',
      pestInfo: {
        scientificName: undefined,
        overview: 'Unable to analyze image. Please try again with a clearer photo.',
        prevention: [
          'Maintain proper irrigation',
          'Monitor for early signs of disease',
          'Use crop rotation'
        ],
        treatment: [
          'Contact local agricultural extension office',
          'Consult with agricultural expert'
        ]
      }
    };
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getMimeType(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return fileType;
    }
    // Default to jpeg if type is unknown
    return 'image/jpeg';
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


