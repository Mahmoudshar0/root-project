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

    const countries = await this.api.fetchCountries();
    this.ui.populateCountryDropdown(countries);

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.ui.elements.searchBtn) {
      this.ui.elements.searchBtn.addEventListener('click', () => {
        this.handleSearch();
      });
    }

    if (this.ui.elements.countrySelect) {
      this.ui.elements.countrySelect.addEventListener('change', (e) => {
        this.handleCountryChange(e.target.value);
      });
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigateTo(view);
      });
    });

    window.addEventListener('popstate', (e) => {
      const view = e.state?.view || 'dashboard';
      this.ui.switchView(view);
      this.loadViewData(view);
    });

    this.handleInitialRoute();

    document.body.addEventListener('click', (e) => {
      const saveBtn = e.target.closest('.holiday-action-btn') || e.target.closest('.event-card-save') || e.target.closest('.btn-event');
      if (saveBtn) {
        this.handleSave(saveBtn);
        return;
      }

      const deleteBtn = e.target.closest('.delete-plan-btn') || e.target.closest('.plan-remove-btn');
      if (deleteBtn) {
        this.handleDelete(deleteBtn);
      }

      const filterBtn = e.target.closest('.plan-filter');
      if (filterBtn) {
        const filter = filterBtn.dataset.filter;
        this.renderMyPlansView(filter);
      }

      if (e.target.closest('#clear-all-plans-btn')) {
        if (confirm('Are you sure you want to delete all saved plans?')) {
          this.storage.clearAllPlans();
          this.renderMyPlansView();
        }
      }
    });

    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => this.handleCurrencyConversion());
    }

    const clearBtn = document.getElementById('clear-selection-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.ui.clearSelection();
      });
    }

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
      });

      if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
      }
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay?.classList.toggle('active');
      });

      sidebarOverlay?.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
      });
    }
    document.querySelectorAll('.event-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.ui.filterEvents(category);
      });
    });
  }

  handleSave(btn) {
    const id = btn.dataset.id || Date.now();
    const title = btn.dataset.title;
    const date = btn.dataset.date;
    const type = btn.dataset.type;
    const location = btn.dataset.location || this.state?.countryName || 'Unknown';
    const extra = btn.dataset.extra;

    if (!title) return;

    const plan = { id, title, date, type, location, extra };
    this.storage.savePlan(plan);

    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      icon.style.color = 'var(--primary-500)';
    }

    const savedPlans = this.storage.getPlans();
    this.ui.updateDashboardStats({ saved: savedPlans.length });

    this.ui.showToast('Plan saved successfully!', 'success');
    console.log('Saved:', plan);
  }

  async handleCountryChange(countryCode) {
    if (!countryCode) return;

    this.ui.toggleCitySelect(false);

    try {
      const data = await this.api.fetchCountryDetails(countryCode);

      if (data && data.capital) {
        this.ui.populateCityDropdown(data.capital);
        this.ui.toggleCitySelect(true);

        this.ui.updateCountryInfo(data, false);
      } else {
        this.ui.populateCityDropdown([]);
        this.ui.toggleCitySelect(true);
      }
    } catch (error) {
      console.error('Error handling country change:', error);
      this.ui.toggleCitySelect(true);
    }
  }

  handleSearch() {
    const countryCode = this.ui.elements.countrySelect.value;
    const countryName = this.ui.elements.countrySelect.options[this.ui.elements.countrySelect.selectedIndex].text.split(' ').slice(1).join(' ');
    const city = this.ui.elements.citySelect.value;
    const year = this.ui.elements.yearSelect.value;

    if (!countryCode) {
      this.ui.showToast('Please select a country', 'error');
      return;
    }

    this.state = { countryCode, countryName, city, year };

    console.log(`Searching for: ${countryCode}, ${city}, ${year}`);
    this.updateDashboard(countryCode, city, year);
  }

  async updateDashboard(countryCode, city, year) {
    const countryData = await this.api.fetchCountryDetails(countryCode);
    this.state.countryData = countryData;
    this.ui.updateCountryInfo(countryData, true);
    this.ui.updateAllViewBadges(countryData, city, year);

    const savedPlans = this.storage.getPlans();
    this.ui.updateDashboardStats({
      holidays: '--',
      events: '--',
      saved: savedPlans.length
    });

    const countryName = countryData?.name?.common || this.state.countryName || 'Unknown';
    const capital = countryData?.capital?.[0] || city || 'Unknown';
    this.ui.showToast(`Exploring ${countryName}, ${capital}!`, 'success');
  }

  async loadViewData(view) {
    if (!this.state || !this.state.countryCode) {
      if (view !== 'dashboard' && view !== 'my-plans') {
        this.ui.showToast('Please select a country first', 'error');
      }
      if (view === 'my-plans') {
        this.renderMyPlansView();
      }
      return;
    }

    const { countryCode, city, year, countryData, countryName } = this.state;

    const loadingMessages = {
      'holidays': 'Finding holidays...',
      'events': 'Discovering events...',
      'weather': 'Fetching weather forecast...',
      'long-weekends': 'Finding long weekends...',
      'sun-times': 'Calculating sun times...'
    };

    if (loadingMessages[view]) {
      this.ui.showLoader(loadingMessages[view]);
    }

    try {
      switch (view) {
        case 'holidays':
          const holidays = await this.api.fetchHolidays(year, countryCode);
          this.ui.renderHolidays(holidays, year, countryName || countryCode);
          this.ui.updateDashboardStats({ holidays: holidays.length });
          break;

        case 'events':
          const events = await this.api.fetchEvents(city, countryCode);
          this.ui.renderEvents(events);
          this.ui.updateDashboardStats({ events: events.length });
          break;

        case 'weather':
          if (countryData?.capitalInfo?.latlng) {
            const [lat, lon] = countryData.capitalInfo.latlng;
            const weather = await this.api.fetchWeather(lat, lon);
            this.ui.renderWeather(weather, city);
          }
          break;

        case 'long-weekends':
          const weekends = await this.api.fetchLongWeekends(year, countryCode);
          this.ui.renderLongWeekends(weekends, year);
          break;

        case 'sun-times':
          if (countryData?.capitalInfo?.latlng) {
            const [lat, lon] = countryData.capitalInfo.latlng;
            const sunTimes = await this.api.fetchSunTimes(lat, lon);
            this.ui.renderSunTimes(sunTimes, city);
          }
          break;

        case 'my-plans':
          this.renderMyPlansView();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error loading view data:', error);
      this.ui.showToast('Failed to load data', 'error');
    } finally {
      this.ui.hideLoader();
    }
  }

  handleDelete(btn) {
    const id = btn.dataset.id;
    this.storage.deletePlan(id);

    const activeFilterBtn = document.querySelector('.plan-filter.active');
    const currentFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

    this.renderMyPlansView(currentFilter);

    const plans = this.storage.getPlans();
    this.ui.updateDashboardStats({ saved: plans.length });
  }

  renderMyPlansView(filter = 'all') {
    const plans = this.storage.getPlans();

    const counts = {
      all: plans.length,
      holiday: plans.filter(p => p.type === 'holiday').length,
      event: plans.filter(p => p.type === 'event').length,
      longweekend: plans.filter(p => p.type === 'longweekend').length
    };

    this.ui.updateFilterCounts(counts);
    this.ui.setActiveFilter(filter);

    let filteredPlans = plans;
    if (filter !== 'all') {
      filteredPlans = plans.filter(p => p.type === filter);
    }

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

      document.querySelector('.conversion-from .amount').textContent = amount.toFixed(2);
      document.querySelector('.conversion-from .currency-code').textContent = from;
      document.querySelector('.conversion-to .amount').textContent = result.toFixed(2);
      document.querySelector('.conversion-to .currency-code').textContent = to;
      document.querySelector('.exchange-rate-info p').textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    }
  }

  navigateTo(view) {
    const url = view === 'dashboard' ? '/' : `/${view}`;
    history.pushState({ view }, '', url);

    this.ui.switchView(view);
    this.loadViewData(view);

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
    }
  }

  handleInitialRoute() {
    const path = window.location.pathname;
    const validViews = ['dashboard', 'holidays', 'events', 'weather', 'long-weekends', 'sun-times', 'my-plans'];

    let view = path.replace('/', '').replace('.html', '') || 'dashboard';

    if (!validViews.includes(view)) {
      view = 'dashboard';
    }

    history.replaceState({ view }, '', path === '/' ? '/' : `/${view}`);

    if (view !== 'dashboard') {
      this.ui.switchView(view);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
