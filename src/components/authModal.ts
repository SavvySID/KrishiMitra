import { AuthService, LoginCredentials, RegisterData } from '../services/authService';
import { Farmer, Location } from '../types';

export class AuthModal {
  private authService: AuthService;
  private modalElement: HTMLElement | null = null;
  private onAuthSuccess: (farmer: Farmer) => void;
  private onAuthCancel: () => void;

  constructor(onAuthSuccess: (farmer: Farmer) => void, onAuthCancel: () => void) {
    this.authService = new AuthService();
    this.onAuthSuccess = onAuthSuccess;
    this.onAuthCancel = onAuthCancel;
  }

  show(isLogin: boolean = true): void {
    this.createModal(isLogin);
    this.modalElement?.classList.add('show');
    document.body.classList.add('modal-open');
  }

  hide(): void {
    this.modalElement?.classList.remove('show');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      this.modalElement?.remove();
      this.modalElement = null;
    }, 300);
  }

  private createModal(isLogin: boolean): void {
    const modalHtml = `
      <div class="auth-modal-overlay" id="authModal">
        <div class="auth-modal">
          <div class="auth-modal-header">
            <h2>${isLogin ? 'Login to KrishiMitra' : 'Join KrishiMitra'}</h2>
            <button class="close-btn" id="closeAuthModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="auth-modal-content">
            ${isLogin ? this.renderLoginForm() : this.renderRegisterForm()}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.modalElement = document.getElementById('authModal');
    this.setupEventListeners(isLogin);
  }

  private renderLoginForm(): string {
    return `
      <form class="auth-form" id="loginForm">
        <div class="form-group">
          <label for="loginEmail">Email Address</label>
          <input type="email" id="loginEmail" name="email" required 
                 placeholder="Enter your email address">
        </div>
        
        <div class="form-group">
          <label for="loginPassword">Password</label>
          <input type="password" id="loginPassword" name="password" required 
                 placeholder="Enter your password">
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i>
            Login
          </button>
        </div>
        
        <div class="auth-switch">
          <p>Don't have an account? 
            <a href="#" id="switchToRegister">Register here</a>
          </p>
        </div>
      </form>
    `;
  }

  private renderRegisterForm(): string {
    return `
      <form class="auth-form" id="registerForm">
        <div class="form-row">
          <div class="form-group">
            <label for="registerName">Full Name *</label>
            <input type="text" id="registerName" name="name" required 
                   placeholder="Enter your full name">
          </div>
          
          <div class="form-group">
            <label for="registerEmail">Email Address *</label>
            <input type="email" id="registerEmail" name="email" required 
                   placeholder="Enter your email address">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="registerPhone">Mobile Number *</label>
            <input type="tel" id="registerPhone" name="phone" required 
                   placeholder="Enter 10-digit mobile number">
          </div>
          
          <div class="form-group">
            <label for="registerLanguage">Preferred Language *</label>
            <select id="registerLanguage" name="language" required>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="regional">Regional</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="registerPassword">Password *</label>
            <input type="password" id="registerPassword" name="password" required 
                   placeholder="Minimum 6 characters">
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required 
                   placeholder="Confirm your password">
          </div>
        </div>
        
        <div class="form-group">
          <label for="locationState">State *</label>
          <select id="locationState" name="state" required>
            <option value="">Select State</option>
            <option value="Delhi">Delhi</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Bihar">Bihar</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Kerala">Kerala</option>
            <option value="Odisha">Odisha</option>
            <option value="Assam">Assam</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Ladakh">Ladakh</option>
            <option value="Goa">Goa</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tripura">Tripura</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="locationDistrict">District *</label>
            <input type="text" id="locationDistrict" name="district" required 
                   placeholder="Enter your district">
          </div>
          
          <div class="form-group">
            <label for="locationVillage">Village/Town *</label>
            <input type="text" id="locationVillage" name="village" required 
                   placeholder="Enter your village or town">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="farmSize">Farm Size (acres) *</label>
            <input type="number" id="farmSize" name="farmSize" required min="0.1" step="0.1"
                   placeholder="Enter farm size in acres">
          </div>
          
          <div class="form-group">
            <label for="experience">Farming Experience (years) *</label>
            <input type="number" id="experience" name="experience" required min="0" max="50"
                   placeholder="Years of farming experience">
          </div>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="termsAccepted" name="termsAccepted" required>
            <span class="checkmark"></span>
            I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
          </label>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-user-plus"></i>
            Create Account
          </button>
        </div>
        
        <div class="auth-switch">
          <p>Already have an account? 
            <a href="#" id="switchToLogin">Login here</a>
          </p>
        </div>
      </form>
    `;
  }

  private setupEventListeners(isLogin: boolean): void {
    // Close modal
    const closeBtn = document.getElementById('closeAuthModal');
    const overlay = document.getElementById('authModal');
    
    closeBtn?.addEventListener('click', () => this.hide());
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    // Form submission
    const form = document.getElementById(isLogin ? 'loginForm' : 'registerForm') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isLogin) {
        this.handleLogin(form);
      } else {
        this.handleRegister(form);
      }
    });

    // Switch between login and register
    const switchLink = document.getElementById(isLogin ? 'switchToRegister' : 'switchToLogin');
    switchLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      setTimeout(() => this.show(!isLogin), 300);
    });

    // Real-time validation
    if (!isLogin) {
      this.setupRegisterValidation();
    }
  }

  private setupRegisterValidation(): void {
    const password = document.getElementById('registerPassword') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    const phone = document.getElementById('registerPhone') as HTMLInputElement;

    // Password confirmation validation
    confirmPassword?.addEventListener('input', () => {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords do not match');
      } else {
        confirmPassword.setCustomValidity('');
      }
    });

    // Phone number formatting
    phone?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      target.value = value;
    });
  }

  private async handleLogin(form: HTMLFormElement): Promise<void> {
    const formData = new FormData(form);
    const credentials: LoginCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    try {
      const response = await this.authService.login(credentials);
      
      if (response.success && response.farmer) {
        this.showSuccessMessage('Login successful! Welcome back.');
        setTimeout(() => {
          this.hide();
          this.onAuthSuccess(response.farmer!);
        }, 1000);
      } else {
        this.showErrorMessage(response.message);
      }
    } catch (error) {
      this.showErrorMessage('Login failed. Please try again.');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  private async handleRegister(form: HTMLFormElement): Promise<void> {
    const formData = new FormData(form);
    
    const registerData: RegisterData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      location: {
        state: formData.get('state') as string,
        district: formData.get('district') as string,
        village: formData.get('village') as string,
        coordinates: { lat: 0, lng: 0 } // Will be updated with actual coordinates
      },
      farmSize: parseFloat(formData.get('farmSize') as string),
      experience: parseInt(formData.get('experience') as string),
      language: formData.get('language') as 'en' | 'hi' | 'regional'
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    try {
      const response = await this.authService.register(registerData);
      
      if (response.success && response.farmer) {
        this.showSuccessMessage('Registration successful! Welcome to KrishiMitra.');
        setTimeout(() => {
          this.hide();
          this.onAuthSuccess(response.farmer!);
        }, 1500);
      } else {
        this.showErrorMessage(response.message);
      }
    } catch (error) {
      this.showErrorMessage('Registration failed. Please try again.');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  private showSuccessMessage(message: string): void {
    this.showMessage(message, 'success');
  }

  private showErrorMessage(message: string): void {
    this.showMessage(message, 'error');
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message auth-message-${type}`;
    messageElement.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    const modalContent = this.modalElement?.querySelector('.auth-modal-content');
    modalContent?.insertBefore(messageElement, modalContent.firstChild);

    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}
