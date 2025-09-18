
import { AppState, Farmer, Location, SoilData, Language, DetectionRecord, MarketPrice } from './types';
import { CropRecommendationService } from './services/cropRecommendationService';
import { WeatherService } from './services/weatherService';
import { AuthService } from './services/authService';
import { AuthModal } from './components/authModal';
import { FarmerProfile } from './components/farmerProfile';
import { mockMarketPrices, mockFinancialSchemes, languages } from './data/mockData';
import { i18n } from './services/i18nService';
import { PestDetectionService } from './services/pestDetectionService';
import { MarketService } from './services/marketService';

export class KrishiMitraApp {
  private getUniqueCrops(): string[] {
    const set = new Set<string>();
    (this.state.marketPrices || []).forEach(p => {
      if (p.cropName) set.add(p.cropName);
    });
    return Array.from(set).sort();
  }
  private state: AppState;
  private cropService: CropRecommendationService;
  private weatherService: WeatherService;
  private authService: AuthService;
  private pestDetection: PestDetectionService;
  private marketService: MarketService;
  private authModal: AuthModal | null = null;
  private farmerProfile: FarmerProfile | null = null;
  private currentView: string = 'dashboard';
  private allMarketPrices: MarketPrice[] = [];
  private selectedStateFilter: string = 'Punjab';
  private selectedCropFilter: string = 'all';

  constructor() {
    this.state = {
      currentUser: null,
      selectedLanguage: languages.find(lang => lang.code === i18n.getCurrentLanguage()) || languages[0],
      currentLocation: null,
      weatherData: null,
      soilData: null,
      cropRecommendations: [],
      marketPrices: mockMarketPrices,
      agriculturalTasks: [],
      diseases: [],
      pests: [],
      financialSchemes: mockFinancialSchemes,
      detectionHistory: []
    };

    this.cropService = new CropRecommendationService();
    this.weatherService = new WeatherService();
    this.authService = new AuthService();
    this.pestDetection = new PestDetectionService();
    this.marketService = new MarketService();
    // Initialize auth modal and farmer profile
    this.authModal = new AuthModal(
      (farmer: Farmer) => this.handleAuthSuccess(farmer),
      () => this.handleAuthCancel()
    );
    this.farmerProfile = new FarmerProfile(
      (farmer: Farmer | null) => this.handleProfileUpdate(farmer)
    );

    // Listen for language changes
    i18n.addLanguageChangeListener((language: string) => {
      this.state.selectedLanguage = languages.find(lang => lang.code === language) || languages[0];
      this.render();
    });
  }

  async init(): Promise<void> {
    // Check for existing user session
    const existingUser = this.authService.getCurrentUser();
    if (existingUser) {
      this.state.currentUser = existingUser;
    }

    // Load detection history
    this.state.detectionHistory = this.pestDetection.getHistory(existingUser?.id);
    
    this.render();
    this.setupEventListeners();
    await this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    // Try to get current location via browser geolocation; fallback to Delhi
    await this.initLocationFromBrowser();
    if (!this.state.currentLocation) {
      this.state.currentLocation = {
        state: 'Delhi',
        district: 'New Delhi',
        village: 'Central Delhi',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      };
    }

    // Load weather data
    if (this.state.currentLocation) {
      this.state.weatherData = await this.weatherService.getCurrentWeather(this.state.currentLocation);
    }

    // Load default soil data
    this.state.soilData = {
      type: 'loamy',
      ph: 6.5,
      organicMatter: 2.1,
      nutrients: {
        nitrogen: 45,
        phosphorus: 25,
        potassium: 180
      },
      moisture: 65
    };

    // Generate crop recommendations
    if (this.state.currentLocation && this.state.soilData && this.state.weatherData) {
      this.state.cropRecommendations = this.cropService.getRecommendations(
        this.state.currentLocation,
        this.state.soilData,
        this.state.weatherData,
        2, // Default farm size
        'kharif'
      );
    }
    // Fetch live market prices on init (Punjab + optional crop)
    try {
      const cropFilter = this.selectedCropFilter === 'all' ? undefined : this.selectedCropFilter;
      const live = await this.marketService.fetchLivePrices(200, 'Punjab', cropFilter);
      if (Array.isArray(live) && live.length) {
        this.state.marketPrices = live;
      }
    } catch {}

    // Load live market prices
    await this.refreshMarketPrices();


    this.render();
  }

  private async initLocationFromBrowser(): Promise<void> {
    if (!('geolocation' in navigator)) {
      return;
    }
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000
        });
      });
      const { latitude, longitude } = position.coords;
      this.state.currentLocation = {
        state: 'Current Location',
        district: 'Nearby',
        village: 'Current',
        coordinates: { lat: latitude, lng: longitude }
      };
    } catch (err) {
      // Permission denied or failure: keep undefined to trigger fallback
    }
  }

  private async refreshMarketPrices(): Promise<void> {
    const state = this.selectedStateFilter;
    const crop = this.selectedCropFilter === 'all' ? undefined : this.selectedCropFilter;
    const live = await this.marketService.fetchLivePrices(200, state, crop);
    this.allMarketPrices = Array.isArray(live) && live.length > 0 ? live : this.allMarketPrices;
    this.applyMarketFilters();
  }

  private applyMarketFilters(): void {
    const filteredByState = this.selectedStateFilter === 'all'
      ? this.allMarketPrices
      : this.allMarketPrices.filter(p => this.extractState(p.location).toLowerCase() === this.selectedStateFilter.toLowerCase());

    const filteredByCrop = this.selectedCropFilter === 'all'
      ? filteredByState
      : filteredByState.filter(p => p.cropName.toLowerCase() === this.selectedCropFilter.toLowerCase());

    this.state.marketPrices = filteredByCrop;
  }

  private extractState(locationStr: string): string {
    if (!locationStr) return '';
    const parts = locationStr.split(',').map(s => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : '';
  }

  private getUniqueStates(): string[] {
    const set = new Set<string>();
    this.allMarketPrices.forEach(p => {
      const st = this.extractState(p.location);
      if (st) set.add(st);
    });
    return Array.from(set).sort();
  }


  private render(): void {
    const appElement = document.querySelector<HTMLDivElement>('#app')!;
    
    appElement.innerHTML = `
      <div class="app-container">
        ${this.renderHeader()}
        ${this.renderNavigation()}
        ${this.renderMainContent()}
        ${this.renderFooter()}
      </div>
    `;

    this.setupEventListeners();
  }

  private renderHeader(): string {
    return `
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <i class="fas fa-seedling logo-icon"></i>
            <h1 class="app-title">${i18n.translate('app.title')}</h1>
            <span class="app-subtitle">${i18n.translate('app.subtitle')}</span>

          </div>
          <div class="header-actions">
            <div class="language-selector">
              <select id="languageSelect" class="language-dropdown">
                ${i18n.getAvailableLanguages().map(lang => 
                  `<option value="${lang.code}" ${lang.code === this.state.selectedLanguage.code ? 'selected' : ''}>
                    ${lang.nameNative}
                  </option>`
                ).join('')}
              </select>
            </div>
            <button class="voice-btn" id="voiceBtn">
              <i class="fas fa-microphone"></i>
              ${i18n.translate('ui.voice')}
            </button>
            <div class="user-menu">
              ${this.state.currentUser ? `
                <button class="user-btn logged-in" id="userBtn">
                  <i class="fas fa-user-circle"></i>
                  <span class="user-name">${this.state.currentUser.name}</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                  <a href="#" class="dropdown-item" id="viewProfile">
                    <i class="fas fa-user"></i> ${i18n.translate('ui.viewProfile')}
                  </a>
                  <a href="#" class="dropdown-item" id="editProfile">
                    <i class="fas fa-edit"></i> ${i18n.translate('ui.editProfile')}
                  </a>
                  <div class="dropdown-divider"></div>
                  <a href="#" class="dropdown-item" id="logout">
                    <i class="fas fa-sign-out-alt"></i> ${i18n.translate('ui.logout')}
                  </a>
                </div>
              ` : `
                <button class="user-btn" id="userBtn">
                  <i class="fas fa-user"></i>
                  ${i18n.translate('ui.loginRegister')}
                </button>
              `}
            </div>
          </div>
        </div>
      </header>
    `;
  }

  private renderNavigation(): string {
    const navItems = [
      { id: 'dashboard', icon: 'fas fa-home', translationKey: 'nav.dashboard' },
      { id: 'crops', icon: 'fas fa-seedling', translationKey: 'nav.crops' },
      { id: 'weather', icon: 'fas fa-cloud-sun', translationKey: 'nav.weather' },
      { id: 'soil', icon: 'fas fa-mountain', translationKey: 'nav.soil' },
      { id: 'market', icon: 'fas fa-chart-line', translationKey: 'nav.market' },
      { id: 'calendar', icon: 'fas fa-calendar-alt', translationKey: 'nav.calendar' },
      { id: 'diseases', icon: 'fas fa-bug', translationKey: 'nav.diseases' },
      { id: 'finance', icon: 'fas fa-rupee-sign', translationKey: 'nav.finance' }
    ];

    return `
      <nav class="app-navigation">
        <div class="nav-container">
          ${navItems.map(item => `
            <button class="nav-item ${this.currentView === item.id ? 'active' : ''}" 
                    data-view="${item.id}">
              <i class="${item.icon}"></i>
              <span class="nav-label">${i18n.translate(item.translationKey)}</span>
            </button>
          `).join('')}
        </div>
      </nav>
    `;
  }

  private renderMainContent(): string {
    switch (this.currentView) {
      case 'dashboard':
        return this.renderDashboard();
      case 'crops':
        return this.renderCropAdvisory();
      case 'weather':
        return this.renderWeather();
      case 'soil':
        return this.renderSoilHealth();
      case 'market':
        return this.renderMarketPrices();
      case 'calendar':
        return this.renderFarmCalendar();
      case 'diseases':
        return this.renderDiseasesPests();
      case 'finance':
        return this.renderFinancialAid();
      default:
        return this.renderDashboard();
    }
  }

  private renderDashboard(): string {
    const weatherAlerts = this.state.weatherData ? 
      this.weatherService.getWeatherAlerts(this.state.weatherData) : [];
    
    return `
      <main class="main-content">
        <div class="dashboard-container">
          <div class="dashboard-header">
            <h2>${i18n.translate('app.welcome')}</h2>
            <p>${i18n.translate('app.welcomeSubtitle')}</p>
          </div>
          
          <div class="dashboard-grid">
            <div class="dashboard-card weather-card">
              <h3><i class="fas fa-cloud-sun"></i> ${i18n.translate('dashboard.currentWeather')}</h3>
              ${this.state.weatherData ? `
                <div class="weather-info">
                  <div class="weather-main">
                    <span class="temperature">${this.state.weatherData.temperature}°C</span>
                    <span class="humidity">${i18n.translate('dashboard.humidity')}: ${this.state.weatherData.humidity}%</span>
                  </div>
                  <div class="weather-details">
                    <span>${i18n.translate('dashboard.rainfall')}: ${this.state.weatherData.rainfall}mm</span>
                    <span>${i18n.translate('dashboard.wind')}: ${this.state.weatherData.windSpeed} km/h</span>
                  </div>
                </div>
              ` : `<p>${i18n.translate('ui.loadingWeather')}</p>`}
            </div>

            <div class="dashboard-card alerts-card">
              <h3><i class="fas fa-exclamation-triangle"></i> ${i18n.translate('dashboard.weatherAlerts')}</h3>
              <div class="alerts-list">
                ${weatherAlerts.length > 0 ? 
                  weatherAlerts.map(alert => `<div class="alert-item">${alert}</div>`).join('') :
                  `<p>${i18n.translate('dashboard.noAlerts')}</p>`
                }
              </div>
            </div>

            <div class="dashboard-card crops-card">
              <h3><i class="fas fa-seedling"></i> ${i18n.translate('dashboard.recommendedCrops')}</h3>
              <div class="crops-list">
                ${this.state.cropRecommendations.slice(0, 3).map(rec => `
                  <div class="crop-item">
                    <span class="crop-name">${rec.crop.name}</span>
                    <span class="crop-score">${Math.round(rec.score * 100)}% ${i18n.translate('dashboard.match')}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="dashboard-card market-card">
              <h3><i class="fas fa-chart-line"></i> ${i18n.translate('dashboard.marketPrices')}</h3>
              <div class="market-list">
                ${this.state.marketPrices.slice(0, 3).map(price => `
                  <div class="market-item">
                    <span class="crop-name">${price.cropName}</span>
                    <span class="price">₹${price.price}/${price.unit}</span>
                    <span class="trend ${price.trend}">
                      <i class="fas fa-arrow-${price.trend === 'up' ? 'up' : price.trend === 'down' ? 'down' : 'right'}"></i>
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  private renderCropAdvisory(): string {
    return `
      <main class="main-content">
        <div class="crop-advisory-container">
          <h2>${i18n.translate('crops.title')}</h2>

          <div class="assistant-section">
            <div class="assistant-inputs">
              <div class="ai-text-input">
                <input id="assistantPrompt" class="ai-input" type="text" placeholder="Type your question (English/Hindi/Punjabi)" />
                <button class="ask-ai-btn" id="assistantAskBtn">Ask</button>
                <button class="voice-btn" id="assistantVoiceBtn">
                  <i class="fas fa-microphone"></i>
                </button>
              </div>
              <div id="assistantStatus" class="voice-status"></div>
            </div>
            <div class="assistant-examples">
              <div class="examples-title">Try asking:</div>
              <div class="examples-chips">
                <button class="example-chip" data-prompt="Which crop should I grow this Kharif season in Punjab for best profit?">Kharif crop for best profit in Punjab</button>
                <button class="example-chip" data-prompt="Give irrigation schedule and fertilizer plan for wheat in loamy soil.">Irrigation + fertilizer plan for wheat</button>
                <button class="example-chip" data-prompt="My rice leaves have brown spots. What should I do now?">Treat brown spots on rice leaves</button>
                <button class="example-chip" data-prompt="Suggest low water crops for sandy soil in winter in Haryana.">Low-water crops for sandy soil (winter)</button>
                <button class="example-chip" data-prompt="High market demand crops for next month in Delhi region.">High demand crops next month</button>
              </div>
            </div>
            <div id="assistantOutput" class="ai-advisory"></div>
          </div>
        </div>
      </main>
    `;
  }

  private renderWeather(): string {
    return `
      <main class="main-content">
        <div class="weather-container">
          <h2>Weather Advisory</h2>
          ${this.state.weatherData ? `
            <div class="current-weather">
              <h3>Current Conditions</h3>
              <div class="weather-grid">
                <div class="weather-metric">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>Location: ${this.state.currentLocation ? `${this.state.currentLocation.district}, ${this.state.currentLocation.state}` : '—'}</span>
                </div>
                <div class="weather-metric">
                  <i class="fas fa-thermometer-half"></i>
                  <span>Temperature: ${this.state.weatherData.temperature}°C</span>
                </div>
                <div class="weather-metric">
                  <i class="fas fa-tint"></i>
                  <span>Humidity: ${this.state.weatherData.humidity}%</span>
                </div>
                <div class="weather-metric">
                  <i class="fas fa-cloud-rain"></i>
                  <span>Rainfall: ${this.state.weatherData.rainfall} mm</span>
                </div>
                <div class="weather-metric">
                  <i class="fas fa-wind"></i>
                  <span>Wind Speed: ${this.state.weatherData.windSpeed} km/h</span>
                </div>
                <div class="weather-metric">
                  <i class="fas fa-tachometer-alt"></i>
                  <span>Pressure: ${this.state.weatherData.pressure} hPa</span>
                </div>
              </div>
            </div>
            
            <div class="forecast-section">
              <h3>7-Day Forecast</h3>
              <div class="forecast-grid">
                ${this.state.weatherData.forecast.map(day => `
                  <div class="forecast-card">
                    <div class="forecast-date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div class="forecast-temp">
                      <span class="max-temp">${Math.round(day.temperature.max)}°C</span>
                      <span class="min-temp">${Math.round(day.temperature.min)}°C</span>
                    </div>
                    <div class="forecast-condition">
                      <i class="fas fa-${this.getWeatherIcon(day.condition)}"></i>
                      <span>${day.condition}</span>
                    </div>
                    <div class="forecast-details">
                      <span>Humidity: ${Math.round(day.humidity)}%</span>
                      <span>Rain: ${Math.round(day.rainfall)} mm</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="irrigation-recommendations">
              <h3>Irrigation Recommendations</h3>
              <div class="recommendations-list">
                ${this.weatherService.getIrrigationRecommendations(this.state.weatherData).map(rec => 
                  `<div class="recommendation-item">${rec}</div>`
                ).join('')}
              </div>
            </div>
          ` : '<p>Loading weather data...</p>'}
        </div>
      </main>
    `;
  }

  private renderSoilHealth(): string {
    return `
      <main class="main-content">
        <div class="soil-health-container">
          <h2>Soil Health Management</h2>
          ${this.state.soilData ? `
            <div class="soil-overview">
              <h3>Current Soil Analysis</h3>
              <div class="soil-metrics">
                <div class="soil-metric">
                  <span class="metric-label">Soil Type</span>
                  <span class="metric-value">${this.state.soilData.type}</span>
                </div>
                <div class="soil-metric">
                  <span class="metric-label">pH Level</span>
                  <span class="metric-value ${this.getSoilHealthClass('ph', this.state.soilData.ph)}">${this.state.soilData.ph}</span>
                </div>
                <div class="soil-metric">
                  <span class="metric-label">Organic Matter</span>
                  <span class="metric-value ${this.getSoilHealthClass('organic', this.state.soilData.organicMatter)}">${this.state.soilData.organicMatter}%</span>
                </div>
                <div class="soil-metric">
                  <span class="metric-label">Moisture</span>
                  <span class="metric-value ${this.getSoilHealthClass('moisture', this.state.soilData.moisture)}">${this.state.soilData.moisture}%</span>
                </div>
              </div>
            </div>
            
            <div class="nutrient-analysis">
              <h3>Nutrient Levels</h3>
              <div class="nutrients-grid">
                <div class="nutrient-item">
                  <span class="nutrient-name">Nitrogen (N)</span>
                  <div class="nutrient-bar">
                    <div class="nutrient-fill" style="width: ${(this.state.soilData.nutrients.nitrogen / 100) * 100}%"></div>
                  </div>
                  <span class="nutrient-value">${this.state.soilData.nutrients.nitrogen} ppm</span>
                </div>
                <div class="nutrient-item">
                  <span class="nutrient-name">Phosphorus (P)</span>
                  <div class="nutrient-bar">
                    <div class="nutrient-fill" style="width: ${(this.state.soilData.nutrients.phosphorus / 50) * 100}%"></div>
                  </div>
                  <span class="nutrient-value">${this.state.soilData.nutrients.phosphorus} ppm</span>
                </div>
                <div class="nutrient-item">
                  <span class="nutrient-name">Potassium (K)</span>
                  <div class="nutrient-bar">
                    <div class="nutrient-fill" style="width: ${(this.state.soilData.nutrients.potassium / 200) * 100}%"></div>
                  </div>
                  <span class="nutrient-value">${this.state.soilData.nutrients.potassium} ppm</span>
                </div>
              </div>
            </div>
            
            <div class="soil-recommendations">
              <h3>Soil Improvement Recommendations</h3>
              <div class="recommendations-list">
                <div class="recommendation-item">
                  <i class="fas fa-seedling"></i>
                  <span>Add organic compost to improve soil structure</span>
                </div>
                <div class="recommendation-item">
                  <i class="fas fa-flask"></i>
                  <span>Apply lime to adjust pH level to optimal range (6.0-7.0)</span>
                </div>
                <div class="recommendation-item">
                  <i class="fas fa-tint"></i>
                  <span>Improve drainage to prevent waterlogging</span>
                </div>
              </div>
            </div>
          ` : '<p>Loading soil data...</p>'}
        </div>
      </main>
    `;
  }

  private renderMarketPrices(): string {
  const crops = this.getUniqueCrops();
    return `
      <main class="main-content">
        <div class="market-prices-container">
          <h2>Market Intelligence</h2>
          <div class="market-filters">
            <select id="stateFilter" class="filter-select">
              <option value="Punjab" ${this.selectedStateFilter === 'Punjab' ? 'selected' : ''}>Punjab</option>
            </select>
            <select id="cropFilter" class="filter-select">
              <option value="all" ${this.selectedCropFilter === 'all' ? 'selected' : ''}>All Crops</option>
              ${crops.map((c: string) => `<option value="${c}" ${this.selectedCropFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <button class="refresh-btn" id="refreshPrices">
              <i class="fas fa-sync-alt"></i> Refresh Prices
            </button>
          </div>
          
          
          <div class="prices-grid">
            ${this.state.marketPrices.map(price => `
              <div class="price-card">
                <div class="price-header">
                  <h3>${price.cropName}</h3>
                  <span class="trend-indicator ${price.trend}">
                    <i class="fas fa-arrow-${price.trend === 'up' ? 'up' : price.trend === 'down' ? 'down' : 'right'}"></i>
                    ${price.trend}
                  </span>
                </div>
                <div class="price-details">
                  <div class="price-main">
                    <span class="price-value">₹${price.price}</span>
                    <span class="price-unit">per ${price.unit}</span>
                  </div>
                  <div class="price-info">
                    <span class="location">📍 ${price.location}</span>
                    <span class="date">📅 ${price.date.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="market-insights">
            <h3>Market Insights</h3>
            <div class="insights-grid">
              <div class="insight-card">
                <h4>Price Trends</h4>
                <p>Rice prices are trending upward due to increased demand</p>
              </div>
              <div class="insight-card">
                <h4>Best Selling Locations</h4>
                <p>Delhi and Mumbai offer the highest prices for most crops</p>
              </div>
              <div class="insight-card">
                <h4>Demand Forecast</h4>
                <p>Wheat demand expected to increase in next quarter</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  private renderFarmCalendar(): string {
    return `
      <main class="main-content">
        <div class="farm-calendar-container">
          <h2>Agricultural Calendar</h2>
          <div class="calendar-controls">
            <button class="calendar-btn" id="prevMonth">
              <i class="fas fa-chevron-left"></i>
            </button>
            <h3 id="currentMonth">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <button class="calendar-btn" id="nextMonth">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="calendar-grid">
            <div class="calendar-header">
              <div class="day-header">Sun</div>
              <div class="day-header">Mon</div>
              <div class="day-header">Tue</div>
              <div class="day-header">Wed</div>
              <div class="day-header">Thu</div>
              <div class="day-header">Fri</div>
              <div class="day-header">Sat</div>
            </div>
            <div class="calendar-body" id="calendarBody">
              <!-- Calendar will be populated by JavaScript -->
            </div>
          </div>
          
          <div class="upcoming-tasks">
            <h3>Upcoming Tasks</h3>
            <div class="tasks-list">
              <div class="task-item">
                <div class="task-date">Dec 15</div>
                <div class="task-content">
                  <h4>Rice Sowing</h4>
                  <p>Prepare field and sow rice seeds</p>
                </div>
                <div class="task-priority high">High</div>
              </div>
              <div class="task-item">
                <div class="task-date">Dec 20</div>
                <div class="task-content">
                  <h4>Fertilizer Application</h4>
                  <p>Apply NPK fertilizer to wheat crop</p>
                </div>
                <div class="task-priority medium">Medium</div>
              </div>
              <div class="task-item">
                <div class="task-date">Dec 25</div>
                <div class="task-content">
                  <h4>Irrigation</h4>
                  <p>Water the cotton field</p>
                </div>
                <div class="task-priority low">Low</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  private renderDiseasesPests(): string {
    return `
      <main class="main-content">
        <div class="diseases-pests-container">
          <h2>Disease & Pest Management</h2>
          
          <div class="detection-section">
            <h3>Image-Based Detection</h3>
            <div class="upload-area">
              <input type="file" id="imageUpload" accept="image/*" style="display: none;">
              <div class="upload-box" id="uploadBox">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload plant image for disease/pest detection</p>
                <button class="upload-btn">Choose Image</button>
              </div>
            </div>
            <div class="detection-result" id="detectionResult"></div>
          </div>
          
          <div class="diseases-section">
            <h3>Common Diseases</h3>
            <div class="diseases-grid">
              <div class="disease-card">
                <h4>Rice Blast</h4>
                <p><strong>Symptoms:</strong> Brown spots on leaves, white powdery growth</p>
                <p><strong>Treatment:</strong> Apply Tricyclazole, use resistant varieties</p>
                <p><strong>Prevention:</strong> Avoid excessive nitrogen, maintain proper spacing</p>
              </div>
              <div class="disease-card">
                <h4>Wheat Rust</h4>
                <p><strong>Symptoms:</strong> Orange pustules on leaves, yellowing</p>
                <p><strong>Treatment:</strong> Apply Propiconazole, fungicide spray</p>
                <p><strong>Prevention:</strong> Crop rotation, resistant varieties</p>
              </div>
            </div>
          </div>
          
          <div class="pests-section">
            <h3>Common Pests</h3>
            <div class="pests-grid">
              <div class="pest-card">
                <h4>Rice Stem Borer</h4>
                <p><strong>Damage:</strong> Dead hearts in young plants, white heads</p>
                <p><strong>Control:</strong> Pheromone traps, Carbofuran, Trichogramma</p>
              </div>
              <div class="pest-card">
                <h4>Cotton Bollworm</h4>
                <p><strong>Damage:</strong> Holes in bolls, reduced fiber quality</p>
                <p><strong>Control:</strong> Bt cotton, Spinosad, natural predators</p>
              </div>
            </div>
          </div>

          <div class="history-section">
            <h3>Recent Detections</h3>
            <div class="history-list" id="detectionHistory">
              ${this.renderDetectionHistory()}
            </div>
          </div>
        </div>
      </main>
    `;
  }

  private renderFinancialAid(): string {
    return `
      <main class="main-content">
        <div class="financial-aid-container">
          <h2>Financial Advisory & Government Schemes</h2>
          
          <div class="schemes-grid">
            ${this.state.financialSchemes.map(scheme => `
              <div class="scheme-card">
                <div class="scheme-header">
                  <h3>${scheme.name}</h3>
                  <span class="scheme-type">Government Scheme</span>
                </div>
                <div class="scheme-content">
                  <p class="scheme-description">${scheme.description}</p>
                  
                  <div class="scheme-details">
                    <h4>Eligibility:</h4>
                    <ul>
                      ${scheme.eligibility.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    
                    <h4>Benefits:</h4>
                    <ul>
                      ${scheme.benefits.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    
                    <h4>Application Process:</h4>
                    <ol>
                      ${scheme.applicationProcess.map(item => `<li>${item}</li>`).join('')}
                    </ol>
                    
                    <div class="contact-info">
                      <strong>Contact:</strong> ${scheme.contactInfo}
                    </div>
                  </div>
                  
                  <button class="apply-btn">Apply Now</button>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="financial-tools">
            <h3>Financial Tools</h3>
            <div class="tools-grid">
              <div class="tool-card">
                <h4>Crop Insurance Calculator</h4>
                <p>Calculate premium and coverage for your crops</p>
                <button class="tool-btn">Calculate</button>
              </div>
              <div class="tool-card">
                <h4>Loan Eligibility Checker</h4>
                <p>Check your eligibility for agricultural loans</p>
                <button class="tool-btn">Check Eligibility</button>
              </div>
              <div class="tool-card">
                <h4>Subsidy Finder</h4>
                <p>Find available subsidies for your farming needs</p>
                <button class="tool-btn">Find Subsidies</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  private renderFooter(): string {
    return `
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>KrishiMitra</h4>
            <p>Empowering farmers with smart agricultural solutions</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#crops">Crop Advisory</a></li>
              <li><a href="#weather">Weather</a></li>
              <li><a href="#market">Market Prices</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Support</h4>
            <p>📞 Toll-free: 1800-180-1551</p>
            <p>📧 support@krishimitra.gov.in</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 KrishiMitra. Built for Smart India Hackathon.</p>
        </div>
      </footer>
    `;
  }

  private setupEventListeners(): void {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const view = target.closest('.nav-item')?.getAttribute('data-view');
        if (view) {
          this.currentView = view;
          this.render();
        }
      });
    });

    // Language selector
    const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        const selectedLangCode = (e.target as HTMLSelectElement).value;
        i18n.setLanguage(selectedLangCode);
      });
    }

    // Voice advisory button (in Crop Advisory)
    const assistantVoiceBtn = document.getElementById('assistantVoiceBtn');
    if (assistantVoiceBtn) {
      assistantVoiceBtn.addEventListener('click', () => {
        this.handleAssistantVoice();
      });
    }

    // Assistant Ask via text
    const assistantAsk = document.getElementById('assistantAskBtn');
    const assistantPrompt = document.getElementById('assistantPrompt') as HTMLInputElement;
    if (assistantAsk && assistantPrompt) {
      assistantAsk.addEventListener('click', async () => {
        const query = (assistantPrompt.value || '').trim();
        const outputEl = document.getElementById('assistantOutput');
        if (!query) return;
        await this.requestAssistantAdvice(query);
      });
    }

    // Assistant details submit
    const submitDetails = document.getElementById('assistantSubmitDetails');
    if (submitDetails) {
      submitDetails.addEventListener('click', async () => {
        const assistantPrompt = (document.getElementById('assistantPrompt') as HTMLInputElement)?.value || '';
        await this.requestAssistantAdvice(assistantPrompt);
      });
    }

    // Example chips -> fill and ask
    document.querySelectorAll('.example-chip').forEach(el => {
      el.addEventListener('click', async () => {
        const prompt = (el as HTMLElement).getAttribute('data-prompt') || '';
        const input = document.getElementById('assistantPrompt') as HTMLInputElement | null;
        if (input) input.value = prompt;
        await this.requestAssistantAdvice(prompt);
      });
    });


    // User button and dropdown
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userBtn) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.state.currentUser) {
          // Toggle dropdown for logged-in users
          userDropdown?.classList.toggle('show');
        } else {
          // Show login modal for non-logged-in users
          this.authModal?.show(true);
        }
      });
    }

    // User dropdown items
    document.getElementById('viewProfile')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.state.currentUser) {
        this.farmerProfile?.show(this.state.currentUser);
        userDropdown?.classList.remove('show');
      }
    });

    document.getElementById('editProfile')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.state.currentUser) {
        this.farmerProfile?.show(this.state.currentUser);
        userDropdown?.classList.remove('show');
      }
    });

    document.getElementById('logout')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLogout();
      userDropdown?.classList.remove('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.user-menu')) {
        userDropdown?.classList.remove('show');
      }
    });

    // Image upload for disease detection
    const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
    const uploadBox = document.getElementById('uploadBox');
    if (imageUpload && uploadBox) {
      uploadBox.addEventListener('click', () => {
        imageUpload.click();
      });
      
      imageUpload.addEventListener('change', (e) => {
        this.handleImageUpload(e);
      });
    }

    // Refresh prices
    const refreshBtn = document.getElementById('refreshPrices');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        try {
          const cropFilter = this.selectedCropFilter === 'all' ? undefined : this.selectedCropFilter;
          const live = await this.marketService.fetchLivePrices(200, 'Punjab', cropFilter);
          if (Array.isArray(live) && live.length) {
            this.state.marketPrices = live;
          }
        } catch {}
        await this.refreshMarketPrices();
        this.render();
      });
    }
    // Crop filter change
    const cropFilterEl = document.getElementById('cropFilter') as HTMLSelectElement;
    if (cropFilterEl) {
      cropFilterEl.addEventListener('change', async (e) => {
        this.selectedCropFilter = (e.target as HTMLSelectElement).value;
        try {
          const cropFilter = this.selectedCropFilter === 'all' ? undefined : this.selectedCropFilter;
          const live = await this.marketService.fetchLivePrices(200, 'Punjab', cropFilter);
          if (Array.isArray(live) && live.length) {
            this.state.marketPrices = live;
          } else {
            this.state.marketPrices = [] as any;
          }
        } catch {
          // leave existing prices if API fails
        }
        this.render();
      });
    }
  }

  private handleVoiceInput(): void {
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = this.state.selectedLanguage.code === 'hi' ? 'hi-IN' : 'en-US';
      recognition.start();
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.processVoiceCommand(transcript);
      };
    } else {
      alert('Voice recognition not supported in this browser');
    }
  }

  private async requestAssistantAdvice(userQuery: string): Promise<void> {
    const outputEl = document.getElementById('assistantOutput');
    if (outputEl) outputEl.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Getting advisory...</div>';

    const lang = this.state.selectedLanguage.code as any;
    const location = this.state.currentLocation;
    const context: any = {
      state: location?.state,
      district: location?.district,
      temperatureC: this.state.weatherData?.temperature,
      rainfallMm: this.state.weatherData?.rainfall,
      ph: this.state.soilData?.ph,
      organicMatter: this.state.soilData?.organicMatter
    };

    const prompt = `${userQuery}\n\nContext (JSON): ${JSON.stringify(context)}`;

    try {
      const { AIService } = await import('./services/aiService');
      const ai = new AIService();
      const advice = await ai.getCropAdvisory(prompt, lang);
      if (outputEl) outputEl.innerHTML = `<div class="advice-card">${advice.replace(/\n/g, '<br>')}</div>`;
    } catch (e) {
      const keyMissing = !(import.meta as any)?.env?.VITE_GEMINI_API_KEY && !(import.meta as any)?.env?.vite_gemini_api_key;
      if (outputEl) {
        const groqPresent = Boolean((import.meta as any)?.env?.VITE_GROQ_API_KEY || (import.meta as any)?.env?.vite_groq_api_key);
        const geminiPresent = Boolean((import.meta as any)?.env?.VITE_GEMINI_API_KEY || (import.meta as any)?.env?.vite_gemini_api_key);
        const missingMsg = !groqPresent && !geminiPresent
          ? 'Missing AI API key. Add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY in your .env and restart.'
          : 'Could not generate advice. Please try again.';
        outputEl.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${missingMsg}</div>`;
      }
    }
  }

  private async handleAssistantVoice(): Promise<void> {
    const statusEl = document.getElementById('assistantStatus');
    const sr = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!sr) {
      if (statusEl) statusEl.textContent = 'Voice recognition not supported in this browser';
      return;
    }
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      if (statusEl) statusEl.textContent = 'Voice requires HTTPS or localhost.';
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Microphone permission denied';
      return;
    }
    const recognition = new sr();
    const langCode = this.state.selectedLanguage.code;
    recognition.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'pa' ? 'pa-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    if (statusEl) statusEl.textContent = 'Listening...';
    try { recognition.start(); } catch {}

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      (document.getElementById('assistantPrompt') as HTMLInputElement).value = transcript;
      if (statusEl) statusEl.textContent = `Heard: ${transcript}`;
      await this.requestAssistantAdvice(transcript);
    };
    recognition.onerror = (e: any) => {
      const code = e?.error || 'unknown';
      if (statusEl) statusEl.textContent = code === 'not-allowed' ? 'Microphone permission denied' : 'Voice error: ' + code;
    };
    recognition.onend = () => {
      if (statusEl) statusEl.textContent = '';
    };
  }

  private processVoiceCommand(command: string): void {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('weather')) {
      this.currentView = 'weather';
    } else if (lowerCommand.includes('crop') || lowerCommand.includes('फसल')) {
      this.currentView = 'crops';
    } else if (lowerCommand.includes('market') || lowerCommand.includes('बाजार')) {
      this.currentView = 'market';
    } else if (lowerCommand.includes('soil') || lowerCommand.includes('मिट्टी')) {
      this.currentView = 'soil';
    }
    
    this.render();
  }

  private async handleVoiceAdvisory(): Promise<void> {
    const statusEl = document.getElementById('voiceStatus');
    const outputEl = document.getElementById('aiAdvisory');
    const langCode = this.state.selectedLanguage.code;
    const sr = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!sr) {
      if (statusEl) statusEl.textContent = 'Voice recognition not supported in this browser';
      return;
    }
    // Secure context and permission preflight
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      if (statusEl) statusEl.textContent = 'Voice requires HTTPS or localhost.';
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Microphone permission denied';
      return;
    }
    const recognition = new sr();
    recognition.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'pa' ? 'pa-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    if (statusEl) statusEl.textContent = 'Listening...';
    try {
      recognition.start();
    } catch {}

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (statusEl) statusEl.textContent = `Heard: ${transcript}`;
      if (outputEl) outputEl.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Getting advisory...</div>';
      try {
        const { AIService } = await import('./services/aiService');
        const ai = new AIService();
        const advice = await ai.getCropAdvisory(transcript, langCode as any);
        if (outputEl) outputEl.innerHTML = `<div class="advice-card">${advice.replace(/\n/g, '<br>')}</div>`;
      } catch (e) {
        if (outputEl) outputEl.textContent = 'Failed to get advisory. Please try again.';
      }
    };

    recognition.onerror = (e: any) => {
      const code = e?.error || 'unknown';
      if (statusEl) statusEl.textContent = code === 'not-allowed' ? 'Microphone permission denied' : 'Voice error: ' + code;
    };

    recognition.onend = () => {
      if (statusEl) statusEl.textContent = '';
    };
  }

  private handleAuthSuccess(farmer: Farmer): void {
    this.state.currentUser = farmer;
    this.state.selectedLanguage = languages.find(lang => lang.code === farmer.language) || languages[0];
    this.render();
  }

  private handleAuthCancel(): void {
    // User cancelled authentication, do nothing
  }

  private handleProfileUpdate(farmer: Farmer | null): void {
    if (farmer === null) {
      // User logged out or deleted account
      this.state.currentUser = null;
      this.authService.logout();
    } else {
      // Profile was updated
      this.state.currentUser = farmer;
    }
    this.render();
  }

  private handleLogout(): void {
    this.authService.logout();
    this.state.currentUser = null;
    this.render();
  }

  private async handleImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const detectContainer = document.getElementById('detectionResult');
      if (detectContainer) {
        detectContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing image...</div>';
      }

      try {
        const record = await this.pestDetection.detectFromFile(file, this.state.currentUser?.id || undefined);
        // Update state and history UI
        this.state.detectionHistory = [record, ...(this.state.detectionHistory || [])].slice(0, 100);
        const historyEl = document.getElementById('detectionHistory');
        if (historyEl) {
          historyEl.innerHTML = this.renderDetectionHistory();
        }

        if (detectContainer) {
          detectContainer.innerHTML = this.renderDetectionResult(record);
        }
      } catch (err) {
        if (detectContainer) {
          detectContainer.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> Detection failed. Please try another image.</div>';
        }
      } finally {
        // Reset input so same file can be uploaded again
        input.value = '';
      }
    }
  }

  private renderDetectionResult(record: DetectionRecord): string {
    const r = record.result;
    const conf = Math.round(r.confidence * 100);
    const prevention = r.pestInfo?.prevention?.map(p => `<li>${p}</li>`).join('') || '';
    const treatment = r.pestInfo?.treatment?.map(t => `<li>${t}</li>`).join('') || '';
    return `
      <div class="result-card">
        <div class="result-header">
          <h4>${r.displayName}</h4>
          <span class="badge">${r.category}</span>
          <span class="confidence">Confidence: ${conf}%</span>
        </div>
        <div class="result-body">
          <div class="result-image"><img src="${record.imageUrl}" alt="Detection image"/></div>
          <div class="result-info">
            ${r.pestInfo?.scientificName ? `<p><strong>Scientific:</strong> ${r.pestInfo.scientificName}</p>` : ''}
            ${r.pestInfo?.overview ? `<p>${r.pestInfo.overview}</p>` : ''}
            ${prevention ? `<h5>Prevention</h5><ul>${prevention}</ul>` : ''}
            ${treatment ? `<h5>Treatment</h5><ul>${treatment}</ul>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private renderDetectionHistory(): string {
    const history = this.state.detectionHistory || [];
    if (history.length === 0) {
      return '<p>No detections yet. Upload an image to get started.</p>';
    }
    return history.slice(0, 6).map(rec => `
      <div class="history-item">
        <div class="thumb"><img src="${rec.imageUrl}" alt="thumb"/></div>
        <div class="meta">
          <div class="title">${rec.result.displayName}</div>
          <div class="sub">${new Date(rec.createdAt).toLocaleString()} • ${Math.round(rec.result.confidence * 100)}%</div>
        </div>
      </div>
    `).join('');
  }

  private getWeatherIcon(condition: string): string {
    switch (condition) {
      case 'sunny': return 'sun';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'cloud-rain';
      case 'stormy': return 'bolt';
      default: return 'cloud';
    }
  }

  private getSoilHealthClass(type: string, value: number): string {
    switch (type) {
      case 'ph':
        return value >= 6 && value <= 7.5 ? 'good' : 'poor';
      case 'organic':
        return value >= 2 ? 'good' : 'poor';
      case 'moisture':
        return value >= 50 && value <= 80 ? 'good' : 'poor';
      default:
        return 'neutral';
    }
  }

}
