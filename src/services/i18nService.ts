// Internationalization Service for KrishiMitra
export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nameNative: string;
  direction: 'ltr' | 'rtl';
}

export class I18nService {
  private currentLanguage: string = 'en';
  private translations: { [language: string]: Translation } = {};
  private listeners: Array<(language: string) => void> = [];

  constructor() {
    this.loadTranslations();
    this.currentLanguage = this.getStoredLanguage() || 'en';
  }

  private loadTranslations(): void {
    // English translations
    this.translations.en = {
      // Common
      app: {
        title: 'KrishiMitra',
        subtitle: 'Smart Agricultural Advisory',
        welcome: 'Welcome to KrishiMitra',
        welcomeSubtitle: 'Your smart agricultural companion for better farming decisions'
      },
      
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        crops: 'Crop Advisory',
        weather: 'Weather',
        soil: 'Soil Health',
        market: 'Market Prices',
        calendar: 'Farm Calendar',
        diseases: 'Diseases & Pests',
        finance: 'Financial Aid'
      },

      // Auth
      auth: {
        login: 'Login to KrishiMitra',
        register: 'Join KrishiMitra',
        email: 'Email Address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        fullName: 'Full Name',
        mobileNumber: 'Mobile Number',
        preferredLanguage: 'Preferred Language',
        state: 'State',
        district: 'District',
        village: 'Village/Town',
        farmSize: 'Farm Size (acres)',
        experience: 'Farming Experience (years)',
        termsAccepted: 'I agree to the Terms of Service and Privacy Policy',
        loginBtn: 'Login',
        registerBtn: 'Create Account',
        switchToRegister: "Don't have an account? Register here",
        switchToLogin: 'Already have an account? Login here',
        loginSuccess: 'Login successful! Welcome back.',
        registerSuccess: 'Registration successful! Welcome to KrishiMitra.',
        loginFailed: 'Login failed. Please try again.',
        registerFailed: 'Registration failed. Please try again.'
      },

      // Dashboard
      dashboard: {
        currentWeather: 'Current Weather',
        weatherAlerts: 'Weather Alerts',
        recommendedCrops: 'Recommended Crops',
        marketPrices: 'Market Prices',
        humidity: 'Humidity',
        rainfall: 'Rainfall',
        wind: 'Wind',
        noAlerts: 'No alerts at the moment',
        match: 'match'
      },

      // Crop Advisory
      crops: {
        title: 'Crop Recommendation Engine',
        season: 'Season',
        duration: 'Duration',
        waterNeed: 'Water Need',
        expectedYield: 'Expected Yield',
        estimatedProfit: 'Estimated Profit',
        whyThisCrop: 'Why this crop?',
        sowing: 'Sowing',
        harvesting: 'Harvesting',
        refresh: 'Refresh'
      },

      // Weather
      weather: {
        title: 'Weather Advisory',
        currentConditions: 'Current Conditions',
        temperature: 'Temperature',
        humidity: 'Humidity',
        rainfall: 'Rainfall',
        windSpeed: 'Wind Speed',
        forecast: '7-Day Forecast',
        irrigationRecommendations: 'Irrigation Recommendations'
      },

      // Soil Health
      soil: {
        title: 'Soil Health Management',
        currentAnalysis: 'Current Soil Analysis',
        soilType: 'Soil Type',
        phLevel: 'pH Level',
        organicMatter: 'Organic Matter',
        moisture: 'Moisture',
        nutrientLevels: 'Nutrient Levels',
        nitrogen: 'Nitrogen (N)',
        phosphorus: 'Phosphorus (P)',
        potassium: 'Potassium (K)',
        improvementRecommendations: 'Soil Improvement Recommendations'
      },

      // Market
      market: {
        title: 'Market Intelligence',
        allLocations: 'All Locations',
        refreshPrices: 'Refresh Prices',
        marketInsights: 'Market Insights',
        priceTrends: 'Price Trends',
        bestSellingLocations: 'Best Selling Locations',
        demandForecast: 'Demand Forecast'
      },

      // Calendar
      calendar: {
        title: 'Agricultural Calendar',
        upcomingTasks: 'Upcoming Tasks',
        riceSowing: 'Rice Sowing',
        fertilizerApplication: 'Fertilizer Application',
        irrigation: 'Irrigation',
        priority: {
          high: 'High',
          medium: 'Medium',
          low: 'Low'
        }
      },

      // Diseases & Pests
      diseases: {
        title: 'Disease & Pest Management',
        imageDetection: 'Image-Based Detection',
        uploadImage: 'Click to upload plant image for disease/pest detection',
        chooseImage: 'Choose Image',
        commonDiseases: 'Common Diseases',
        commonPests: 'Common Pests',
        symptoms: 'Symptoms',
        treatment: 'Treatment',
        prevention: 'Prevention',
        damage: 'Damage',
        control: 'Control'
      },

      // Financial Aid
      finance: {
        title: 'Financial Advisory & Government Schemes',
        governmentScheme: 'Government Scheme',
        eligibility: 'Eligibility',
        benefits: 'Benefits',
        applicationProcess: 'Application Process',
        contact: 'Contact',
        applyNow: 'Apply Now',
        financialTools: 'Financial Tools',
        cropInsuranceCalculator: 'Crop Insurance Calculator',
        loanEligibilityChecker: 'Loan Eligibility Checker',
        subsidyFinder: 'Subsidy Finder',
        calculate: 'Calculate',
        checkEligibility: 'Check Eligibility',
        findSubsidies: 'Find Subsidies'
      },

      // Profile
      profile: {
        title: 'Farmer Profile',
        overview: 'Overview',
        editProfile: 'Edit Profile',
        settings: 'Settings',
        personalInfo: 'Personal Information',
        locationInfo: 'Location Information',
        farmingInfo: 'Farming Information',
        farmSize: 'Farm Size',
        experience: 'Experience',
        language: 'Language',
        memberSince: 'Member Since',
        saveChanges: 'Save Changes',
        cancel: 'Cancel',
        accountSettings: 'Account Settings',
        changePassword: 'Change Password',
        dataExport: 'Data Export',
        privacySecurity: 'Privacy & Security',
        profileVisibility: 'Profile Visibility',
        dataSharing: 'Data Sharing',
        dangerZone: 'Danger Zone',
        deleteAccount: 'Delete Account',
        public: 'Public',
        private: 'Private'
      },

      // Common UI
      ui: {
        voice: 'Voice',
        loginRegister: 'Login / Register',
        viewProfile: 'View Profile',
        editProfile: 'Edit Profile',
        logout: 'Logout',
        loading: 'Loading...',
        loadingWeather: 'Loading weather data...',
        loadingSoil: 'Loading soil data...',
        selectState: 'Select State',
        enterEmail: 'Enter your email address',
        enterPassword: 'Enter your password',
        enterName: 'Enter your full name',
        enterMobile: 'Enter 10-digit mobile number',
        enterDistrict: 'Enter your district',
        enterVillage: 'Enter your village or town',
        enterFarmSize: 'Enter farm size in acres',
        enterExperience: 'Years of farming experience',
        minCharacters: 'Minimum 6 characters',
        confirmPasswordPlaceholder: 'Confirm your password'
      },

      // Footer
      footer: {
        empoweringFarmers: 'Empowering farmers with smart agricultural solutions',
        quickLinks: 'Quick Links',
        support: 'Support',
        tollFree: 'Toll-free: 1800-180-1551',
        email: 'support@krishimitra.gov.in',
        copyright: 'Built for Smart India Hackathon.'
      }
    };

    // Punjabi translations
    this.translations.pa = {
      // Common
      app: {
        title: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ',
        subtitle: 'ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ',
        welcome: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਵਿੱਚ ਸਵਾਗਤ ਹੈ',
        welcomeSubtitle: 'ਬਿਹਤਰ ਖੇਤੀਬਾੜੀ ਫੈਸਲਿਆਂ ਲਈ ਤੁਹਾਡਾ ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਸਾਥੀ'
      },
      
      // Navigation
      nav: {
        dashboard: 'ਡੈਸ਼ਬੋਰਡ',
        crops: 'ਫਸਲ ਸਲਾਹ',
        weather: 'ਮੌਸਮ',
        soil: 'ਮਿੱਟੀ ਦਾ ਸਿਹਤ',
        market: 'ਬਾਜ਼ਾਰ ਮੁੱਲ',
        calendar: 'ਖੇਤ ਕੈਲੰਡਰ',
        diseases: 'ਰੋਗ ਅਤੇ ਕੀਟ',
        finance: 'ਵਿੱਤੀ ਸਹਾਇਤਾ'
      },

      // Auth
      auth: {
        login: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਵਿੱਚ ਲੌਗਇਨ ਕਰੋ',
        register: 'ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
        email: 'ਈਮੇਲ ਪਤਾ',
        password: 'ਪਾਸਵਰਡ',
        confirmPassword: 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
        fullName: 'ਪੂਰਾ ਨਾਮ',
        mobileNumber: 'ਮੋਬਾਈਲ ਨੰਬਰ',
        preferredLanguage: 'ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ',
        state: 'ਰਾਜ',
        district: 'ਜ਼ਿਲ੍ਹਾ',
        village: 'ਪਿੰਡ/ਕਸਬਾ',
        farmSize: 'ਖੇਤ ਦਾ ਆਕਾਰ (ਏਕੜ)',
        experience: 'ਖੇਤੀਬਾੜੀ ਤਜਰਬਾ (ਸਾਲ)',
        termsAccepted: 'ਮੈਂ ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ ਅਤੇ ਗੁਪਤਤਾ ਨੀਤੀ ਨਾਲ ਸਹਿਮਤ ਹਾਂ',
        loginBtn: 'ਲੌਗਇਨ',
        registerBtn: 'ਖਾਤਾ ਬਣਾਓ',
        switchToRegister: 'ਕੀ ਤੁਹਾਡਾ ਖਾਤਾ ਨਹੀਂ ਹੈ? ਇੱਥੇ ਰਜਿਸਟਰ ਕਰੋ',
        switchToLogin: 'ਕੀ ਤੁਹਾਡਾ ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ? ਇੱਥੇ ਲੌਗਇਨ ਕਰੋ',
        loginSuccess: 'ਲੌਗਇਨ ਸਫਲ! ਵਾਪਸ ਸਵਾਗਤ ਹੈ।',
        registerSuccess: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ! ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਵਿੱਚ ਸਵਾਗਤ ਹੈ।',
        loginFailed: 'ਲੌਗਇਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
        registerFailed: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।'
      },

      // Dashboard
      dashboard: {
        currentWeather: 'ਮੌਜੂਦਾ ਮੌਸਮ',
        weatherAlerts: 'ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ',
        recommendedCrops: 'ਸਿਫਾਰਸ਼ੀ ਫਸਲਾਂ',
        marketPrices: 'ਬਾਜ਼ਾਰ ਮੁੱਲ',
        humidity: 'ਨਮੀ',
        rainfall: 'ਬਾਰਿਸ਼',
        wind: 'ਹਵਾ',
        noAlerts: 'ਇਸ ਸਮੇਂ ਕੋਈ ਚੇਤਾਵਨੀ ਨਹੀਂ',
        match: 'ਮੈਚ'
      },

      // Crop Advisory
      crops: {
        title: 'ਫਸਲ ਸਿਫਾਰਸ਼ ਇੰਜਨ',
        season: 'ਮੌਸਮ',
        duration: 'ਅਵਧੀ',
        waterNeed: 'ਪਾਣੀ ਦੀ ਲੋੜ',
        expectedYield: 'ਅਪੇਖਿਤ ਪੈਦਾਵਾਰ',
        estimatedProfit: 'ਅਨੁਮਾਨਿਤ ਲਾਭ',
        whyThisCrop: 'ਇਹ ਫਸਲ ਕਿਉਂ?',
        sowing: 'ਬੀਜਾਈ',
        harvesting: 'ਕਟਾਈ',
        refresh: 'ਤਾਜ਼ਾ ਕਰੋ'
      },

      // Weather
      weather: {
        title: 'ਮੌਸਮ ਸਲਾਹ',
        currentConditions: 'ਮੌਜੂਦਾ ਹਾਲਾਤ',
        temperature: 'ਤਾਪਮਾਨ',
        humidity: 'ਨਮੀ',
        rainfall: 'ਬਾਰਿਸ਼',
        windSpeed: 'ਹਵਾ ਦੀ ਗਤੀ',
        forecast: '7-ਦਿਨ ਦਾ ਪੂਰਵਾਨੁਮਾਨ',
        irrigationRecommendations: 'ਸਿੰਚਾਈ ਸਿਫਾਰਸ਼ਾਂ'
      },

      // Soil Health
      soil: {
        title: 'ਮਿੱਟੀ ਦਾ ਸਿਹਤ ਪ੍ਰਬੰਧਨ',
        currentAnalysis: 'ਮੌਜੂਦਾ ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ',
        soilType: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
        phLevel: 'pH ਪੱਧਰ',
        organicMatter: 'ਜੈਵਿਕ ਪਦਾਰਥ',
        moisture: 'ਨਮੀ',
        nutrientLevels: 'ਪੋਸ਼ਕ ਤੱਤ ਪੱਧਰ',
        nitrogen: 'ਨਾਈਟ੍ਰੋਜਨ (N)',
        phosphorus: 'ਫਾਸਫੋਰਸ (P)',
        potassium: 'ਪੋਟਾਸ਼ੀਅਮ (K)',
        improvementRecommendations: 'ਮਿੱਟੀ ਸੁਧਾਰ ਸਿਫਾਰਸ਼ਾਂ'
      },

      // Market
      market: {
        title: 'ਬਾਜ਼ਾਰ ਖੁਫੀਆ',
        allLocations: 'ਸਾਰੇ ਸਥਾਨ',
        refreshPrices: 'ਮੁੱਲ ਤਾਜ਼ਾ ਕਰੋ',
        marketInsights: 'ਬਾਜ਼ਾਰ ਦੀ ਸਮਝ',
        priceTrends: 'ਮੁੱਲ ਰੁਝਾਨ',
        bestSellingLocations: 'ਸਭ ਤੋਂ ਵਧੀਆ ਵਿਕਰੀ ਸਥਾਨ',
        demandForecast: 'ਮੰਗ ਪੂਰਵਾਨੁਮਾਨ'
      },

      // Calendar
      calendar: {
        title: 'ਖੇਤੀਬਾੜੀ ਕੈਲੰਡਰ',
        upcomingTasks: 'ਆਉਣ ਵਾਲੇ ਕੰਮ',
        riceSowing: 'ਚੌਲ ਬੀਜਾਈ',
        fertilizerApplication: 'ਖਾਦ ਲਗਾਉਣਾ',
        irrigation: 'ਸਿੰਚਾਈ',
        priority: {
          high: 'ਉੱਚ',
          medium: 'ਮੱਧਮ',
          low: 'ਘੱਟ'
        }
      },

      // Diseases & Pests
      diseases: {
        title: 'ਰੋਗ ਅਤੇ ਕੀਟ ਪ੍ਰਬੰਧਨ',
        imageDetection: 'ਚਿੱਤਰ-ਆਧਾਰਿਤ ਖੋਜ',
        uploadImage: 'ਰੋਗ/ਕੀਟ ਖੋਜ ਲਈ ਪੌਦੇ ਦਾ ਚਿੱਤਰ ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
        chooseImage: 'ਚਿੱਤਰ ਚੁਣੋ',
        commonDiseases: 'ਆਮ ਰੋਗ',
        commonPests: 'ਆਮ ਕੀਟ',
        symptoms: 'ਲੱਛਣ',
        treatment: 'ਇਲਾਜ',
        prevention: 'ਰੋਕਥਾਮ',
        damage: 'ਨੁਕਸਾਨ',
        control: 'ਨਿਯੰਤਰਣ'
      },

      // Financial Aid
      finance: {
        title: 'ਵਿੱਤੀ ਸਲਾਹ ਅਤੇ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
        governmentScheme: 'ਸਰਕਾਰੀ ਯੋਜਨਾ',
        eligibility: 'ਯੋਗਤਾ',
        benefits: 'ਫਾਇਦੇ',
        applicationProcess: 'ਅਰਜ਼ੀ ਪ੍ਰਕਿਰਿਆ',
        contact: 'ਸੰਪਰਕ',
        applyNow: 'ਹੁਣੇ ਅਰਜ਼ੀ ਦੇਓ',
        financialTools: 'ਵਿੱਤੀ ਉਪਕਰਣ',
        cropInsuranceCalculator: 'ਫਸਲ ਬੀਮਾ ਕੈਲਕੁਲੇਟਰ',
        loanEligibilityChecker: 'ਲੋਨ ਯੋਗਤਾ ਚੈਕਰ',
        subsidyFinder: 'ਸਬਸਿਡੀ ਖੋਜਕ',
        calculate: 'ਗਣਨਾ ਕਰੋ',
        checkEligibility: 'ਯੋਗਤਾ ਚੈਕ ਕਰੋ',
        findSubsidies: 'ਸਬਸਿਡੀਆਂ ਲੱਭੋ'
      },

      // Profile
      profile: {
        title: 'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ',
        overview: 'ਸੰਖੇਪ',
        editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ',
        settings: 'ਸੈਟਿੰਗਾਂ',
        personalInfo: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',
        locationInfo: 'ਸਥਾਨ ਜਾਣਕਾਰੀ',
        farmingInfo: 'ਖੇਤੀਬਾੜੀ ਜਾਣਕਾਰੀ',
        farmSize: 'ਖੇਤ ਦਾ ਆਕਾਰ',
        experience: 'ਤਜਰਬਾ',
        language: 'ਭਾਸ਼ਾ',
        memberSince: 'ਮੈਂਬਰ ਸਾਲ',
        saveChanges: 'ਬਦਲਾਅ ਸੇਵ ਕਰੋ',
        cancel: 'ਰੱਦ ਕਰੋ',
        accountSettings: 'ਖਾਤਾ ਸੈਟਿੰਗਾਂ',
        changePassword: 'ਪਾਸਵਰਡ ਬਦਲੋ',
        dataExport: 'ਡੇਟਾ ਐਕਸਪੋਰਟ',
        privacySecurity: 'ਗੁਪਤਤਾ ਅਤੇ ਸੁਰੱਖਿਆ',
        profileVisibility: 'ਪ੍ਰੋਫਾਈਲ ਦਿਖਾਓ',
        dataSharing: 'ਡੇਟਾ ਸਾਂਝਾ ਕਰਨਾ',
        dangerZone: 'ਖ਼ਤਰਨਾਕ ਜ਼ੋਨ',
        deleteAccount: 'ਖਾਤਾ ਮਿਟਾਓ',
        public: 'ਜਨਤਕ',
        private: 'ਨਿੱਜੀ'
      },

      // Common UI
      ui: {
        voice: 'ਆਵਾਜ਼',
        loginRegister: 'ਲੌਗਇਨ / ਰਜਿਸਟਰ',
        viewProfile: 'ਪ੍ਰੋਫਾਈਲ ਦੇਖੋ',
        editProfile: 'ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ',
        logout: 'ਲੌਗਆਉਟ',
        loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
        loadingWeather: 'ਮੌਸਮ ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
        loadingSoil: 'ਮਿੱਟੀ ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
        selectState: 'ਰਾਜ ਚੁਣੋ',
        enterEmail: 'ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ',
        enterPassword: 'ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ',
        enterName: 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
        enterMobile: '10-ਅੰਕੀ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
        enterDistrict: 'ਆਪਣਾ ਜ਼ਿਲ੍ਹਾ ਦਰਜ ਕਰੋ',
        enterVillage: 'ਆਪਣਾ ਪਿੰਡ ਜਾਂ ਕਸਬਾ ਦਰਜ ਕਰੋ',
        enterFarmSize: 'ਏਕੜ ਵਿੱਚ ਖੇਤ ਦਾ ਆਕਾਰ ਦਰਜ ਕਰੋ',
        enterExperience: 'ਖੇਤੀਬਾੜੀ ਤਜਰਬੇ ਦੇ ਸਾਲ',
        minCharacters: 'ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰ',
        confirmPasswordPlaceholder: 'ਆਪਣੇ ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ'
      },

      // Footer
      footer: {
        empoweringFarmers: 'ਕਿਸਾਨਾਂ ਨੂੰ ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਹੱਲਾਂ ਨਾਲ ਸਸ਼ਕਤ ਬਣਾਉਣਾ',
        quickLinks: 'ਤੇਜ਼ ਲਿੰਕ',
        support: 'ਸਹਾਇਤਾ',
        tollFree: 'ਟੋਲ-ਫ੍ਰੀ: 1800-180-1551',
        email: 'support@krishimitra.gov.in',
        copyright: 'ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥੌਨ ਲਈ ਬਣਾਇਆ ਗਿਆ।'
      }
    };
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(language: string): void {
    if (this.translations[language]) {
      this.currentLanguage = language;
      this.storeLanguage(language);
      this.notifyListeners();
    }
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let translation: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        translation = this.translations.en;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    if (typeof translation === 'string') {
      // Replace parameters in translation
      if (params) {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
          return params[param]?.toString() || match;
        });
      }
      return translation;
    }

    return key;
  }

  getAvailableLanguages(): LanguageConfig[] {
    return [
      { code: 'en', name: 'English', nameNative: 'English', direction: 'ltr' },
      { code: 'pa', name: 'Punjabi', nameNative: 'ਪੰਜਾਬੀ', direction: 'ltr' }
    ];
  }

  addLanguageChangeListener(listener: (language: string) => void): void {
    this.listeners.push(listener);
  }

  removeLanguageChangeListener(listener: (language: string) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  private getStoredLanguage(): string | null {
    return localStorage.getItem('krishimitra-language');
  }

  private storeLanguage(language: string): void {
    localStorage.setItem('krishimitra-language', language);
  }
}

// Global instance
export const i18n = new I18nService();
