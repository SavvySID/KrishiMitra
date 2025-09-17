// Core types for KrishiMitra Agricultural Advisory System

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: Location;
  language: 'en' | 'hi' | 'pa' | 'regional';
  farmSize: number; // in acres
  experience: number; // years
  createdAt: Date;
}

export interface Location {
  state: string;
  district: string;
  village: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SoilData {
  type: 'clay' | 'sandy' | 'loamy' | 'silty';
  ph: number;
  organicMatter: number; // percentage
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  moisture: number; // percentage
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  pressure: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  rainfall: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
}

export interface Crop {
  id: string;
  name: string;
  nameHindi: string;
  season: 'kharif' | 'rabi' | 'zaid' | 'all';
  duration: number; // days
  waterRequirement: 'low' | 'medium' | 'high';
  soilType: string[];
  temperatureRange: {
    min: number;
    max: number;
  };
  yield: number; // kg per acre
  marketPrice: number; // per kg
}

export interface CropRecommendation {
  crop: Crop;
  score: number;
  reasons: string[];
  sowingDate: Date;
  harvestingDate: Date;
  expectedYield: number;
  estimatedProfit: number;
}

export interface Disease {
  id: string;
  name: string;
  nameHindi: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  affectedCrops: string[];
}

export interface Pest {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  damage: string[];
  control: string[];
  affectedCrops: string[];
}

export interface MarketPrice {
  cropId: string;
  cropName: string;
  price: number;
  unit: 'kg' | 'quintal' | 'tonne';
  location: string;
  date: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface AgriculturalTask {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  type: 'sowing' | 'fertilizing' | 'irrigation' | 'harvesting' | 'pest_control';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface FinancialScheme {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string[];
  contactInfo: string;
}

export interface Language {
  code: 'en' | 'hi' | 'pa' | 'regional';
  name: string;
  nameNative: string;
}

export interface AppState {
  currentUser: Farmer | null;
  selectedLanguage: Language;
  currentLocation: Location | null;
  weatherData: WeatherData | null;
  soilData: SoilData | null;
  cropRecommendations: CropRecommendation[];
  marketPrices: MarketPrice[];
  agriculturalTasks: AgriculturalTask[];
  diseases: Disease[];
  pests: Pest[];
  financialSchemes: FinancialScheme[];
}
