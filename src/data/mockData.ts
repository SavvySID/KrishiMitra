import { Crop, Disease, Pest, MarketPrice, FinancialScheme, Language } from '../types';

export const mockCrops: Crop[] = [
  {
    id: 'rice',
    name: 'Rice',
    nameHindi: 'चावल',
    season: 'kharif',
    duration: 120,
    waterRequirement: 'high',
    soilType: ['clay', 'loamy'],
    temperatureRange: { min: 20, max: 35 },
    yield: 3000,
    marketPrice: 25
  },
  {
    id: 'wheat',
    name: 'Wheat',
    nameHindi: 'गेहूं',
    season: 'rabi',
    duration: 150,
    waterRequirement: 'medium',
    soilType: ['loamy', 'sandy'],
    temperatureRange: { min: 15, max: 25 },
    yield: 4000,
    marketPrice: 22
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    nameHindi: 'गन्ना',
    season: 'all',
    duration: 365,
    waterRequirement: 'high',
    soilType: ['clay', 'loamy'],
    temperatureRange: { min: 25, max: 35 },
    yield: 80000,
    marketPrice: 3.5
  },
  {
    id: 'cotton',
    name: 'Cotton',
    nameHindi: 'कपास',
    season: 'kharif',
    duration: 180,
    waterRequirement: 'medium',
    soilType: ['sandy', 'loamy'],
    temperatureRange: { min: 20, max: 30 },
    yield: 500,
    marketPrice: 80
  },
  {
    id: 'maize',
    name: 'Maize',
    nameHindi: 'मक्का',
    season: 'kharif',
    duration: 90,
    waterRequirement: 'medium',
    soilType: ['loamy', 'sandy'],
    temperatureRange: { min: 18, max: 30 },
    yield: 2500,
    marketPrice: 20
  }
];

export const mockDiseases: Disease[] = [
  {
    id: 'rice-blast',
    name: 'Rice Blast',
    nameHindi: 'चावल का ब्लास्ट',
    symptoms: ['Brown spots on leaves', 'White powdery growth', 'Stunted growth'],
    treatment: ['Apply Tricyclazole', 'Use resistant varieties', 'Proper field drainage'],
    prevention: ['Avoid excessive nitrogen', 'Maintain proper spacing', 'Regular field monitoring'],
    affectedCrops: ['rice']
  },
  {
    id: 'wheat-rust',
    name: 'Wheat Rust',
    nameHindi: 'गेहूं का रस्ट',
    symptoms: ['Orange pustules on leaves', 'Yellowing of leaves', 'Reduced grain size'],
    treatment: ['Apply Propiconazole', 'Use fungicide spray', 'Remove infected plants'],
    prevention: ['Crop rotation', 'Use resistant varieties', 'Avoid dense planting'],
    affectedCrops: ['wheat']
  }
];

export const mockPests: Pest[] = [
  {
    id: 'rice-borer',
    name: 'Rice Stem Borer',
    nameHindi: 'चावल का तना छेदक',
    description: 'Larva bores into rice stems causing dead hearts',
    damage: ['Dead hearts in young plants', 'White heads in mature plants', 'Reduced yield'],
    control: ['Use pheromone traps', 'Apply Carbofuran', 'Biological control with Trichogramma'],
    affectedCrops: ['rice']
  },
  {
    id: 'cotton-bollworm',
    name: 'Cotton Bollworm',
    nameHindi: 'कपास का बॉलवर्म',
    description: 'Caterpillar feeds on cotton bolls and flowers',
    damage: ['Holes in bolls', 'Reduced fiber quality', 'Yield loss'],
    control: ['Use Bt cotton', 'Apply Spinosad', 'Natural predators'],
    affectedCrops: ['cotton']
  }
];

export const mockMarketPrices: MarketPrice[] = [
  {
    cropId: 'rice',
    cropName: 'Rice',
    price: 25,
    unit: 'kg',
    location: 'Delhi',
    date: new Date(),
    trend: 'up'
  },
  {
    cropId: 'wheat',
    cropName: 'Wheat',
    price: 22,
    unit: 'kg',
    location: 'Punjab',
    date: new Date(),
    trend: 'stable'
  },
  {
    cropId: 'cotton',
    cropName: 'Cotton',
    price: 80,
    unit: 'kg',
    location: 'Gujarat',
    date: new Date(),
    trend: 'down'
  }
];

export const mockFinancialSchemes: FinancialScheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    nameHindi: 'पीएम किसान सम्मान निधि',
    description: 'Direct income support of ₹6000 per year to small and marginal farmers',
    eligibility: ['Small and marginal farmers', 'Landholding up to 2 hectares'],
    benefits: ['₹6000 per year', 'Direct bank transfer', 'No middlemen'],
    applicationProcess: ['Visit nearest CSC', 'Submit land documents', 'Bank account details'],
    contactInfo: 'Toll-free: 1800-180-1551'
  },
  {
    id: 'crop-insurance',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    nameHindi: 'प्रधानमंत्री फसल बीमा योजना',
    description: 'Comprehensive crop insurance scheme for farmers',
    eligibility: ['All farmers', 'All crops covered'],
    benefits: ['Low premium rates', 'Quick claim settlement', 'Coverage for natural calamities'],
    applicationProcess: ['Contact insurance company', 'Submit crop details', 'Pay premium'],
    contactInfo: 'Website: pmfby.gov.in'
  }
];

export const languages: Language[] = [
  { code: 'en', name: 'English', nameNative: 'English' },
  { code: 'hi', name: 'Hindi', nameNative: 'हिंदी' },
  { code: 'regional', name: 'Regional', nameNative: 'क्षेत्रीय' }
];
