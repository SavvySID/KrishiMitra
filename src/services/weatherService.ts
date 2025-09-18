import { WeatherData, WeatherForecast, Location } from '../types';

export class WeatherService {
  private apiKey = (import.meta as any)?.env?.VITE_OPENWEATHER_API_KEY || 'your-openweather-api-key';
  private baseUrl = 'https://api.weatherapi.com/v1';

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(location: Location): Promise<WeatherData> {
    try {
      const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${location.coordinates.lat},${location.coordinates.lng}&aqi=no`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const currentWeather = this.mapCurrentWeatherData(data);
      
      // Also fetch forecast data
      const forecast = await this.getWeatherForecast(location);
      currentWeather.forecast = forecast;
      
      return currentWeather;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getMockWeatherData(location);
    }
  }

  /**
   * Get 7-day weather forecast
   */
  async getWeatherForecast(location: Location): Promise<WeatherForecast[]> {
    try {
      const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${location.coordinates.lat},${location.coordinates.lng}&days=7&aqi=no&alerts=no`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapForecastData(data);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getMockForecast();
    }
  }

  /**
   * Get weather alerts for extreme conditions
   */
  getWeatherAlerts(weatherData: WeatherData): string[] {
    const alerts: string[] = [];

    if (weatherData.temperature > 40) {
      alerts.push('High temperature alert: Avoid field work during peak hours');
    }

    if (weatherData.rainfall > 50) {
      alerts.push('Heavy rainfall expected: Ensure proper drainage');
    }

    if (weatherData.windSpeed > 30) {
      alerts.push('Strong winds expected: Secure farm equipment');
    }

    if (weatherData.humidity > 80) {
      alerts.push('High humidity: Risk of fungal diseases');
    }

    return alerts;
  }

  /**
   * Get irrigation recommendations based on weather
   */
  getIrrigationRecommendations(weatherData: WeatherData): string[] {
    const recommendations: string[] = [];

    if (weatherData.rainfall < 10 && weatherData.temperature > 30) {
      recommendations.push('Irrigation needed: Low rainfall and high temperature');
    }

    if (weatherData.humidity < 40) {
      recommendations.push('Increase irrigation frequency: Low humidity');
    }

    if (weatherData.rainfall > 30) {
      recommendations.push('Reduce irrigation: Sufficient rainfall received');
    }

    return recommendations;
  }

  /**
   * Mock weather data for development
   */
  private getMockWeatherData(location: Location): WeatherData {
    return {
      temperature: 28,
      humidity: 65,
      rainfall: 15,
      windSpeed: 12,
      pressure: 1013,
      forecast: this.getMockForecast()
    };
  }

  /**
   * Mock forecast data for development
   */
  private getMockForecast(): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      forecast.push({
        date,
        temperature: {
          min: 20 + Math.random() * 10,
          max: 30 + Math.random() * 10
        },
        humidity: 50 + Math.random() * 30,
        rainfall: Math.random() * 20,
        condition: this.getRandomCondition()
      });
    }

    return forecast;
  }

  private getRandomCondition(): 'sunny' | 'cloudy' | 'rainy' | 'stormy' {
    const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'];
    return conditions[Math.floor(Math.random() * conditions.length)] as any;
  }

  /**
   * Map WeatherAPI.com current weather response to our format
   */
  private mapCurrentWeatherData(data: any): WeatherData {
    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      rainfall: data.current.precip_mm || 0,
      windSpeed: data.current.wind_kph,
      pressure: data.current.pressure_mb,
      forecast: [] // Will be populated by getWeatherForecast
    };
  }

  /**
   * Map WeatherAPI.com forecast response to our format
   */
  private mapForecastData(data: any): WeatherForecast[] {
    return data.forecast.forecastday.map((day: any) => ({
      date: new Date(day.date),
      temperature: {
        min: day.day.mintemp_c,
        max: day.day.maxtemp_c
      },
      humidity: day.day.avghumidity,
      rainfall: day.day.totalprecip_mm || 0,
      condition: this.mapWeatherCondition(day.day.condition.text)
    }));
  }

  /**
   * Map WeatherAPI.com condition text to our condition enum
   */
  private mapWeatherCondition(condition: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'sunny';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return 'rainy';
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      return 'stormy';
    } else {
      return 'cloudy';
    }
  }
}
