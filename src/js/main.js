import { APIManager } from './api.js';
import { UIManager } from './ui.js';
import { StorageManager } from './storage.js';

class App {
  constructor() {
    this.api = new APIManager();
    this.ui = new UIManager();
    this.storage = new StorageManager();

    this.init();
  }

  async init() {
    console.log('Wanderlust App Initialized');

    // Fetch Countries on Load
    const countries = await this.api.fetchCountries();
    this.ui.populateCountryDropdown(countries);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search Button Click
    if (this.ui.elements.searchBtn) {
      this.ui.elements.searchBtn.addEventListener('click', () => {
        this.handleSearch();
      });
    }

    // Country Change Listener
    if (this.ui.elements.countrySelect) {
      this.ui.elements.countrySelect.addEventListener('change', (e) => {
        this.handleCountryChange(e.target.value);
      });
    }

    // Navigation Links
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.ui.switchView(view);

        // Specific View Logic
        if (view === 'my-plans') {
          this.renderMyPlansView();
        }

        // Auto-close sidebar on mobile
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
          if (overlay) overlay.classList.remove('active');
        }
      });
    });

    // Global Event Delegation (Save & Delete)
    document.body.addEventListener('click', (e) => {
      // Save
      const saveBtn = e.target.closest('.holiday-action-btn') || e.target.closest('.event-card-save') || e.target.closest('.btn-event');
      if (saveBtn) {
        this.handleSave(saveBtn);
        return;
      }

      // Delete
      const deleteBtn = e.target.closest('.delete-plan-btn') || e.target.closest('.plan-remove-btn');
      if (deleteBtn) {
        this.handleDelete(deleteBtn);
      }

      // Filter Plans
      const filterBtn = e.target.closest('.plan-filter');
      if (filterBtn) {
        const filter = filterBtn.dataset.filter;
        this.renderMyPlansView(filter);
      }

      // Clear All Plans
      if (e.target.closest('#clear-all-plans-btn')) {
        if (confirm('Are you sure you want to delete all saved plans?')) {
          this.storage.savePlans([]);
          this.renderMyPlansView();
        }
      }
    });

    // Currency Converter
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => this.handleCurrencyConversion());
    }

    // Clear Selection Button
    const clearBtn = document.getElementById('clear-selection-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.ui.clearSelection();
      });
    }

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // Save preference to localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
      });

      // Restore sidebar state from localStorage
      if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
      }
    }

    // Mobile Menu Button
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay?.classList.toggle('active');
      });

      // Close sidebar when clicking overlay
      sidebarOverlay?.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
      });
    }
  }

  handleSave(btn) {
    // Extract data from button
    const id = btn.dataset.id || Date.now();
    const title = btn.dataset.title;
    const date = btn.dataset.date;
    const type = btn.dataset.type;
    const location = btn.dataset.location || this.state?.countryName || 'Unknown';
    const extra = btn.dataset.extra;

    if (!title) return;

    const plan = { id, title, date, type, location, extra };
    this.storage.savePlan(plan);

    // Visual feedback
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      icon.style.color = 'var(--primary-500)';
    }

    // Update stats immediately
    const savedPlans = this.storage.getPlans();
    this.ui.updateDashboardStats({ saved: savedPlans.length });

    // Optional: Toast notification
    console.log('Saved:', plan);
  }

  async handleCountryChange(countryCode) {
    if (!countryCode) return;

    // Disable city select while loading
    this.ui.toggleCitySelect(false);

    try {
      // Fetch Country Details (includes capital)
      const data = await this.api.fetchCountryDetails(countryCode);

      if (data && data.capital) {
        // Populate City Select with Capital(s)
        this.ui.populateCityDropdown(data.capital);
        this.ui.toggleCitySelect(true);

        // Update Selection Badge (Show Badge, Hide Details)
        this.ui.updateCountryInfo(data, false);
      } else {
        // Handle case where no capital info
        this.ui.populateCityDropdown([]); // Empty or default
        this.ui.toggleCitySelect(true); // Re-enable but empty? Or keep disabled?
      }
    } catch (error) {
      console.error('Error handling country change:', error);
      this.ui.toggleCitySelect(true);
    }
  }

  handleSearch() {
    const countryCode = this.ui.elements.countrySelect.value;
    const countryName = this.ui.elements.countrySelect.options[this.ui.elements.countrySelect.selectedIndex].text.split(' ').slice(1).join(' '); // Hacky way to get name
    const city = this.ui.elements.citySelect.value;
    const year = this.ui.elements.yearSelect.value;

    if (!countryCode) {
      alert('Please select a country');
      return;
    }

    // Store Current State
    this.state = { countryCode, countryName, city, year };

    console.log(`Searching for: ${countryCode}, ${city}, ${year}`);
    // Trigger Dashboard Update (Phase 2 core)
    this.updateDashboard(countryCode, city, year);
  }

  async updateDashboard(countryCode, city, year) {
    // Show loading state (optional)

    // 1. Fetch Country Details
    const countryData = await this.api.fetchCountryDetails(countryCode);
    this.ui.updateCountryInfo(countryData, true); // True = Show Details

    // 2. Fetch Holidays for Stats & View
    const holidays = await this.api.fetchHolidays(year, countryCode);
    this.ui.renderHolidays(holidays, year, this.state?.countryName || countryCode);

    // 3. Update Stats
    const savedPlans = this.storage.getPlans();

    this.ui.updateDashboardStats({
      holidays: holidays.length,
      events: '500+',
      saved: savedPlans.length
    });

    // 4. Fetch Events
    const events = await this.api.fetchEvents(city);
    this.ui.renderEvents(events);

    // 5. Fetch Weather & Sun Times
    if (countryData.capitalInfo && countryData.capitalInfo.latlng) {
      const [lat, lon] = countryData.capitalInfo.latlng;
      const weather = await this.api.fetchWeather(lat, lon);
      console.log(weather)
      this.ui.renderWeather(weather, city);

      const sunTimes = await this.api.fetchSunTimes(lat, lon);
      this.ui.renderSunTimes(sunTimes, city);
    }

    // 6. Fetch Long Weekends
    const weekends = await this.api.fetchLongWeekends(year, countryCode);
    this.ui.renderLongWeekends(weekends, year);

    // 7. Update Stats with explicit count
    // (Optional: update stats logic if we want to show LW count)
  }

  handleDelete(btn) {
    const id = btn.dataset.id;
    this.storage.deletePlan(id);

    // Update UI (maintain current filter if possible)
    const activeFilterBtn = document.querySelector('.plan-filter.active');
    const currentFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

    this.renderMyPlansView(currentFilter);

    // Update dashboard stats too
    const plans = this.storage.getPlans();
    this.ui.updateDashboardStats({ saved: plans.length });
  }

  renderMyPlansView(filter = 'all') {
    const plans = this.storage.getPlans();

    // Calculate counts
    const counts = {
      all: plans.length,
      holiday: plans.filter(p => p.type === 'holiday').length,
      event: plans.filter(p => p.type === 'event').length,
      longweekend: plans.filter(p => p.type === 'longweekend').length
    };

    // Update UI Stats
    this.ui.updateFilterCounts(counts);
    this.ui.setActiveFilter(filter);

    // Apply Filter
    let filteredPlans = plans;
    if (filter !== 'all') {
      filteredPlans = plans.filter(p => p.type === filter);
    }

    // Render
    this.ui.renderSavedPlans(filteredPlans);
  }

  async handleCurrencyConversion() {
    const amount = parseFloat(document.getElementById('currency-amount').value);
    const from = document.getElementById('currency-from').value;
    const to = document.getElementById('currency-to').value;

    if (isNaN(amount)) return;

    const data = await this.api.fetchExchangeRates(from);
    if (data && data.rates) {
      const rate = data.rates[to];
      const result = amount * rate;

      // Update UI (Direct DOM manipulation for simplicity here or add UIManager method)
      document.querySelector('.conversion-from .amount').textContent = amount.toFixed(2);
      document.querySelector('.conversion-from .currency-code').textContent = from;
      document.querySelector('.conversion-to .amount').textContent = result.toFixed(2);
      document.querySelector('.conversion-to .currency-code').textContent = to;
      document.querySelector('.exchange-rate-info p').textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    }
  }
}

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
