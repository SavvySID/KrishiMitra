import { WeatherData, WeatherForecast, Location } from '../types';

export class WeatherService {
  private apiKey = (import.meta as any)?.env?.VITE_OPENWEATHER_API_KEY || 'your-openweather-api-key';

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(location: Location): Promise<WeatherData> {
    try {
      // In a real implementation, you would call OpenWeatherMap API
      // For now, we'll return mock data
      return this.getMockWeatherData(location);
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
      // In a real implementation, you would call OpenWeatherMap API
      return this.getMockForecast();
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
   * Real API implementation (commented out for now)
   */
  /*
  private async fetchFromAPI(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  private async getRealWeatherData(location: Location): Promise<WeatherData> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.coordinates.lat}&lon=${location.coordinates.lng}&appid=${this.apiKey}&units=metric`;
    const data = await this.fetchFromAPI(url);
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || 0,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      forecast: await this.getRealForecast(location)
    };
  }

  private async getRealForecast(location: Location): Promise<WeatherForecast[]> {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coordinates.lat}&lon=${location.coordinates.lng}&appid=${this.apiKey}&units=metric`;
    const data = await this.fetchFromAPI(url);
    
    return data.list.slice(0, 7).map((item: any) => ({
      date: new Date(item.dt * 1000),
      temperature: {
        min: item.main.temp_min,
        max: item.main.temp_max
      },
      humidity: item.main.humidity,
      rainfall: item.rain?.['3h'] || 0,
      condition: this.mapWeatherCondition(item.weather[0].main)
    }));
  }

  private mapWeatherCondition(condition: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' {
    switch (condition.toLowerCase()) {
      case 'clear': return 'sunny';
      case 'clouds': return 'cloudy';
      case 'rain': return 'rainy';
      case 'thunderstorm': return 'stormy';
      default: return 'cloudy';
    }
  }
  */
}
