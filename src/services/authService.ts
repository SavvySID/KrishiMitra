import { Farmer, Location } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: Location;
  farmSize: number;
  experience: number;
  language: 'en' | 'hi' | 'pa' | 'regional';
}

export interface AuthResponse {
  message: string;
  farmer?: Farmer;
}

export class AuthService {
  private readonly STORAGE_KEY = 'krishimitra_farmers';
  private readonly CURRENT_USER_KEY = 'krishimitra_current_user';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input data
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          message: validation.message
        };
      }

      // Check if farmer already exists
      const existingFarmers = this.getStoredFarmers();
      const existingFarmer = existingFarmers.find(f => f.email === data.email);
      
      if (existingFarmer) {
        return {
          message: 'A farmer with this email already exists'
        };
      }

      // Create new farmer
      const newFarmer: Farmer = {
        id: this.generateFarmerId(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        language: data.language,
        farmSize: data.farmSize,
        experience: data.experience,
        createdAt: new Date()
      };

      // Store farmer data
      existingFarmers.push(newFarmer);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFarmers));

      // Auto-login after registration
      this.setCurrentUser(newFarmer);

      return {
        message: 'Registration successful! Welcome to KrishiMitra.',
        farmer: newFarmer
      };
    } catch (error) {

      return {
        message: 'Registration failed. Please try again.'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const farmers = this.getStoredFarmers();
      const farmer = farmers.find(f => f.email === credentials.email);

      if (!farmer) {

        return {
          message: 'No farmer found with this email address'
        };
      }

      // In a real app, you would verify the password hash here
      // For demo purposes, we'll accept any password
      this.setCurrentUser(farmer);


      return {
        message: 'Login successful!',
        farmer: farmer
      };
    } catch (error) {
      return {
        message: 'Login failed. Please try again.'
      };
    }
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): Farmer | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userData) {
      try {
        const farmer = JSON.parse(userData);
        farmer.createdAt = new Date(farmer.createdAt);
        farmer.location.coordinates = farmer.location.coordinates || { lat: 0, lng: 0 };
        return farmer;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  updateFarmerProfile(updatedFarmer: Farmer): Promise<AuthResponse> {
    return new Promise((resolve) => {
      try {
        const farmers = this.getStoredFarmers();
        const farmerIndex = farmers.findIndex(f => f.id === updatedFarmer.id);
        if (farmerIndex === -1) {
          resolve({ message: 'Farmer not found' });
          return;
        }
        farmers[farmerIndex] = updatedFarmer;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(farmers));
        this.setCurrentUser(updatedFarmer);
        resolve({ message: 'Profile updated successfully', farmer: updatedFarmer });
      } catch (error) {
        resolve({ message: 'Profile update failed. Please try again.' });
      }
    });
  }

  private validateRegistrationData(data: RegisterData): { isValid: boolean; message: string } {
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!data.phone || !phoneRegex.test(data.phone.replace(/\D/g, ''))) {
      return { isValid: false, message: 'Please enter a valid 10-digit mobile number' };
    }

    // Password validation
    if (!data.password || data.password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (data.password !== data.confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }

    // Location validation
    if (!data.location || !data.location.state || !data.location.district) {
      return { isValid: false, message: 'Please select your location' };
    }

    // Farm size validation
    if (!data.farmSize || data.farmSize <= 0) {
      return { isValid: false, message: 'Farm size must be greater than 0' };
    }

    // Experience validation
    if (data.experience < 0) {
      return { isValid: false, message: 'Experience cannot be negative' };
    }

    return { isValid: true, message: '' };
  }

  private getStoredFarmers(): Farmer[] {
    const farmersData = localStorage.getItem(this.STORAGE_KEY);
    if (farmersData) {
      try {
        return JSON.parse(farmersData).map((farmer: any) => ({
          ...farmer,
          createdAt: new Date(farmer.createdAt)
        }));
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  private setCurrentUser(farmer: Farmer): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(farmer));
  }

  private generateFarmerId(): string {
    return 'farmer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get all farmers (for admin purposes)
  getAllFarmers(): Farmer[] {
    return this.getStoredFarmers();
  }

  // Delete farmer account
  deleteFarmer(farmerId: string): Promise<AuthResponse> {
    return new Promise((resolve) => {
      try {
        const farmers = this.getStoredFarmers();
        const filteredFarmers = farmers.filter(f => f.id !== farmerId);
        if (filteredFarmers.length === farmers.length) {
          resolve({ message: 'Farmer not found' });
          return;
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFarmers));
        // If deleting current user, logout
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === farmerId) {
          this.logout();
        }
        resolve({ message: 'Account deleted successfully' });
      } catch (error) {
        resolve({ message: 'Account deletion failed. Please try again.' });
      }
    });
  }
}
