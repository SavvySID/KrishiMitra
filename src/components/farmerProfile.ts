import { Farmer, Location } from '../types';
import { AuthService } from '../services/authService';
import { i18n } from '../services/i18nService';

export class FarmerProfile {
  private authService: AuthService;
  private profileElement: HTMLElement | null = null;
  private onProfileUpdate: (farmer: Farmer) => void;

  constructor(onProfileUpdate: (farmer: Farmer) => void) {
    this.authService = new AuthService();
    this.onProfileUpdate = onProfileUpdate;
  }

  show(farmer: Farmer): void {
    this.createProfileModal(farmer);
    this.profileElement?.classList.add('show');
    document.body.classList.add('modal-open');
  }

  hide(): void {
    this.profileElement?.classList.remove('show');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      this.profileElement?.remove();
      this.profileElement = null;
    }, 300);
  }

  private createProfileModal(farmer: Farmer): void {
    const modalHtml = `
      <div class="profile-modal-overlay" id="profileModal">
        <div class="profile-modal">
          <div class="profile-modal-header">
            <h2><i class="fas fa-user"></i> ${i18n.translate('profile.title')}</h2>
            <button class="close-btn" id="closeProfileModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="profile-modal-content">
            ${this.renderProfileContent(farmer)}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.profileElement = document.getElementById('profileModal');
    this.setupEventListeners(farmer);
  }

  private renderProfileContent(farmer: Farmer): string {
    return `
      <div class="profile-tabs">
        <button class="tab-btn active" data-tab="overview">${i18n.translate('profile.overview')}</button>
        <button class="tab-btn" data-tab="edit">${i18n.translate('profile.editProfile')}</button>
        <button class="tab-btn" data-tab="settings">${i18n.translate('profile.settings')}</button>
      </div>

      <div class="profile-content">
        <div class="tab-content active" id="overview">
          ${this.renderOverview(farmer)}
        </div>
        
        <div class="tab-content" id="edit">
          ${this.renderEditForm(farmer)}
        </div>
        
        <div class="tab-content" id="settings">
          ${this.renderSettings(farmer)}
        </div>
      </div>
    `;
  }

  private renderOverview(farmer: Farmer): string {
    return `
      <div class="profile-overview">
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-info">
            <h3>${farmer.name}</h3>
            <p class="profile-email">${farmer.email}</p>
            <p class="profile-phone">${farmer.phone}</p>
            <p class="profile-location">
              <i class="fas fa-map-marker-alt"></i>
              ${farmer.location.village}, ${farmer.location.district}, ${farmer.location.state}
            </p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-seedling"></i>
            </div>
            <div class="stat-content">
              <h4>${i18n.translate('profile.farmSize')}</h4>
              <p>${farmer.farmSize} acres</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-content">
              <h4>${i18n.translate('profile.experience')}</h4>
              <p>${farmer.experience} years</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-language"></i>
            </div>
            <div class="stat-content">
              <h4>${i18n.translate('profile.language')}</h4>
              <p>${this.getLanguageName(farmer.language)}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div class="stat-content">
              <h4>${i18n.translate('profile.memberSince')}</h4>
              <p>${farmer.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button class="btn btn-secondary" id="editProfileBtn">
            <i class="fas fa-edit"></i>
            ${i18n.translate('profile.editProfile')}
          </button>
          <button class="btn btn-outline" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i>
            ${i18n.translate('ui.logout')}
          </button>
        </div>
      </div>
    `;
  }

  private renderEditForm(farmer: Farmer): string {
    return `
      <form class="profile-edit-form" id="profileEditForm">
        <div class="form-section">
          <h3>Personal Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="editName">Full Name *</label>
              <input type="text" id="editName" name="name" required value="${farmer.name}">
            </div>
            
            <div class="form-group">
              <label for="editEmail">Email Address *</label>
              <input type="email" id="editEmail" name="email" required value="${farmer.email}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editPhone">Mobile Number *</label>
              <input type="tel" id="editPhone" name="phone" required value="${farmer.phone}">
            </div>
            
            <div class="form-group">
              <label for="editLanguage">Preferred Language *</label>
              <select id="editLanguage" name="language" required>
                <option value="en" ${farmer.language === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${farmer.language === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                <option value="regional" ${farmer.language === 'regional' ? 'selected' : ''}>Regional</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Location Information</h3>
          <div class="form-group">
            <label for="editState">State *</label>
            <select id="editState" name="state" required>
              <option value="">Select State</option>
              <option value="Delhi" ${farmer.location.state === 'Delhi' ? 'selected' : ''}>Delhi</option>
              <option value="Punjab" ${farmer.location.state === 'Punjab' ? 'selected' : ''}>Punjab</option>
              <option value="Haryana" ${farmer.location.state === 'Haryana' ? 'selected' : ''}>Haryana</option>
              <option value="Uttar Pradesh" ${farmer.location.state === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
              <option value="Gujarat" ${farmer.location.state === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
              <option value="Maharashtra" ${farmer.location.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
              <option value="Karnataka" ${farmer.location.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
              <option value="Tamil Nadu" ${farmer.location.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
              <option value="West Bengal" ${farmer.location.state === 'West Bengal' ? 'selected' : ''}>West Bengal</option>
              <option value="Bihar" ${farmer.location.state === 'Bihar' ? 'selected' : ''}>Bihar</option>
              <option value="Rajasthan" ${farmer.location.state === 'Rajasthan' ? 'selected' : ''}>Rajasthan</option>
              <option value="Madhya Pradesh" ${farmer.location.state === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
              <option value="Andhra Pradesh" ${farmer.location.state === 'Andhra Pradesh' ? 'selected' : ''}>Andhra Pradesh</option>
              <option value="Telangana" ${farmer.location.state === 'Telangana' ? 'selected' : ''}>Telangana</option>
              <option value="Kerala" ${farmer.location.state === 'Kerala' ? 'selected' : ''}>Kerala</option>
              <option value="Odisha" ${farmer.location.state === 'Odisha' ? 'selected' : ''}>Odisha</option>
              <option value="Assam" ${farmer.location.state === 'Assam' ? 'selected' : ''}>Assam</option>
              <option value="Jharkhand" ${farmer.location.state === 'Jharkhand' ? 'selected' : ''}>Jharkhand</option>
              <option value="Chhattisgarh" ${farmer.location.state === 'Chhattisgarh' ? 'selected' : ''}>Chhattisgarh</option>
              <option value="Himachal Pradesh" ${farmer.location.state === 'Himachal Pradesh' ? 'selected' : ''}>Himachal Pradesh</option>
              <option value="Uttarakhand" ${farmer.location.state === 'Uttarakhand' ? 'selected' : ''}>Uttarakhand</option>
              <option value="Jammu and Kashmir" ${farmer.location.state === 'Jammu and Kashmir' ? 'selected' : ''}>Jammu and Kashmir</option>
              <option value="Ladakh" ${farmer.location.state === 'Ladakh' ? 'selected' : ''}>Ladakh</option>
              <option value="Goa" ${farmer.location.state === 'Goa' ? 'selected' : ''}>Goa</option>
              <option value="Manipur" ${farmer.location.state === 'Manipur' ? 'selected' : ''}>Manipur</option>
              <option value="Meghalaya" ${farmer.location.state === 'Meghalaya' ? 'selected' : ''}>Meghalaya</option>
              <option value="Mizoram" ${farmer.location.state === 'Mizoram' ? 'selected' : ''}>Mizoram</option>
              <option value="Nagaland" ${farmer.location.state === 'Nagaland' ? 'selected' : ''}>Nagaland</option>
              <option value="Sikkim" ${farmer.location.state === 'Sikkim' ? 'selected' : ''}>Sikkim</option>
              <option value="Tripura" ${farmer.location.state === 'Tripura' ? 'selected' : ''}>Tripura</option>
              <option value="Arunachal Pradesh" ${farmer.location.state === 'Arunachal Pradesh' ? 'selected' : ''}>Arunachal Pradesh</option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editDistrict">District *</label>
              <input type="text" id="editDistrict" name="district" required value="${farmer.location.district}">
            </div>
            
            <div class="form-group">
              <label for="editVillage">Village/Town *</label>
              <input type="text" id="editVillage" name="village" required value="${farmer.location.village}">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Farming Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="editFarmSize">Farm Size (acres) *</label>
              <input type="number" id="editFarmSize" name="farmSize" required min="0.1" step="0.1" value="${farmer.farmSize}">
            </div>
            
            <div class="form-group">
              <label for="editExperience">Farming Experience (years) *</label>
              <input type="number" id="editExperience" name="experience" required min="0" max="80" value="${farmer.experience}">
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i>
            Save Changes
          </button>
          <button type="button" class="btn btn-secondary" id="cancelEdit">
            Cancel
          </button>
        </div>
      </form>
    `;
  }

  private renderSettings(farmer: Farmer): string {
    return `
      <div class="profile-settings">
        <div class="settings-section">
          <h3>Account Settings</h3>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
            <button class="btn btn-outline" id="changePasswordBtn">
              Change Password
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>Data Export</h4>
              <p>Download your farming data</p>
            </div>
            <button class="btn btn-outline" id="exportDataBtn">
              Export Data
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Privacy & Security</h3>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Profile Visibility</h4>
              <p>Control who can see your profile</p>
            </div>
            <select class="setting-select" id="profileVisibility">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>Data Sharing</h4>
              <p>Allow data sharing for research</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="dataSharing" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-section danger-zone">
          <h3>Danger Zone</h3>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button class="btn btn-danger" id="deleteAccountBtn">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(farmer: Farmer): void {
    // Close modal
    const closeBtn = document.getElementById('closeProfileModal');
    const overlay = document.getElementById('profileModal');
    
    closeBtn?.addEventListener('click', () => this.hide());
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.getAttribute('data-tab');
        this.switchTab(tabName!);
      });
    });

    // Profile edit form
    const editForm = document.getElementById('profileEditForm') as HTMLFormElement;
    editForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProfileUpdate(editForm, farmer);
    });

    // Cancel edit
    document.getElementById('cancelEdit')?.addEventListener('click', () => {
      this.switchTab('overview');
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.handleLogout();
    });

    // Delete account
    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
      this.handleDeleteAccount(farmer);
    });

    // Change password
    document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
      this.showChangePasswordModal(farmer);
    });

    // Export data
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
      this.exportFarmerData(farmer);
    });
  }

  private switchTab(tabName: string): void {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
  }

  private async handleProfileUpdate(form: HTMLFormElement, farmer: Farmer): Promise<void> {
    const formData = new FormData(form);
    
    const updatedFarmer: Farmer = {
      ...farmer,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      language: formData.get('language') as 'en' | 'hi' | 'regional',
      location: {
        ...farmer.location,
        state: formData.get('state') as string,
        district: formData.get('district') as string,
        village: formData.get('village') as string
      },
      farmSize: parseFloat(formData.get('farmSize') as string),
      experience: parseInt(formData.get('experience') as string)
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    try {
      const response = await this.authService.updateFarmerProfile(updatedFarmer);
      
  if (response.farmer) {
        this.showMessage('Profile updated successfully!', 'success');
        setTimeout(() => {
          this.hide();
          this.onProfileUpdate(response.farmer!);
        }, 1000);
      } else {
        this.showMessage(response.message, 'error');
      }
    } catch (error) {
      this.showMessage('Profile update failed. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  private handleLogout(): void {
    this.authService.logout();
    this.hide();
    this.onProfileUpdate(null as any); // Trigger logout in parent
  }

  private async handleDeleteAccount(farmer: Farmer): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.'
    );

    if (confirmed) {
      const doubleConfirmed = confirm(
        'This is your final warning. Your account and all associated data will be permanently deleted. Are you absolutely sure?'
      );

      if (doubleConfirmed) {
        try {
          const response = await this.authService.deleteFarmer(farmer.id);
          if (response.message && response.message.toLowerCase().includes('deleted')) {
            alert('Your account has been deleted successfully.');
            this.hide();
            this.onProfileUpdate(null as any); // Trigger logout in parent
          } else {
            alert(response.message);
          }
        } catch (error) {
          alert('Account deletion failed. Please try again.');
        }
      }
    }
  }

  private showChangePasswordModal(farmer: Farmer): void {
    const modalHtml = `
      <div class="password-modal-overlay" id="passwordModal">
        <div class="password-modal">
          <div class="password-modal-header">
            <h3>Change Password</h3>
            <button class="close-btn" id="closePasswordModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="password-modal-content">
            <form id="changePasswordForm">
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" required>
              </div>
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" id="newPassword" name="newPassword" required minlength="6">
              </div>
              <div class="form-group">
                <label for="confirmNewPassword">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" name="confirmNewPassword" required>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Change Password</button>
                <button type="button" class="btn btn-secondary" id="cancelPasswordChange">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const passwordModal = document.getElementById('passwordModal');
    passwordModal?.classList.add('show');

    // Setup password change form
    const passwordForm = document.getElementById('changePasswordForm') as HTMLFormElement;
    passwordForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePasswordChange(passwordForm);
    });

    // Close password modal
    document.getElementById('closePasswordModal')?.addEventListener('click', () => {
      passwordModal?.remove();
    });
    document.getElementById('cancelPasswordChange')?.addEventListener('click', () => {
      passwordModal?.remove();
    });
  }

  private handlePasswordChange(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    // In a real app, you would update the password here
    alert('Password changed successfully!');
    document.getElementById('passwordModal')?.remove();
  }

  private exportFarmerData(farmer: Farmer): void {
    const data = {
      farmer: farmer,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishimitra-data-${farmer.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showMessage('Data exported successfully!', 'success');
  }

  private getLanguageName(code: string): string {
    switch (code) {
      case 'en': return 'English';
      case 'hi': return 'हिन्दी (Hindi)';
      case 'pa': return 'ਪੰਜਾਬੀ (Punjabi)';
      case 'regional': return 'Regional';
      default: return 'English';
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    const messageElement = document.createElement('div');
    messageElement.className = `profile-message profile-message-${type}`;
    messageElement.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    const modalContent = this.profileElement?.querySelector('.profile-modal-content');
    modalContent?.insertBefore(messageElement, modalContent?.firstChild);

    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}
