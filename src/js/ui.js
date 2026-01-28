export class UIManager {
  constructor() {
    this.elements = {
      countrySelect: document.getElementById('global-country'),
      citySelect: document.getElementById('global-city'),
      yearSelect: document.getElementById('global-year'),
      searchBtn: document.getElementById('global-search-btn'),
      // Add more elements as needed
    };
  }

  populateCountryDropdown(countries) {
    const select = this.elements.countrySelect;

    // 1. Hide original select
    select.style.display = 'none';

    // 2. Sort countries safely
    const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));

    // 3. Populate original select for fallback/sync
    select.innerHTML = '<option value="">Select Country</option>';
    sortedCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.countryCode;
      option.textContent = country.name;
      select.appendChild(option);
    });

    // 4. Create/Get Custom Dropdown Container
    const parent = select.parentNode;
    let customDropdown = parent.querySelector('.custom-dropdown');

    if (customDropdown) {
      customDropdown.remove(); // Re-create to ensure clean state
    }

    customDropdown = document.createElement('div');
    customDropdown.className = 'custom-dropdown';

    // 5. Create Trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';
    trigger.innerHTML = `
      <div class="selected-value">
        <span>Select Country</span>
      </div>
      <i class="fa-solid fa-chevron-down"></i>
    `;

    // 6. Create Menu
    const menu = document.createElement('div');
    menu.className = 'custom-dropdown-menu';

    // Search Input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'dropdown-search-container';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dropdown-search-input';
    searchInput.placeholder = 'Search countries...';
    searchContainer.appendChild(searchInput);

    // Options List
    const list = document.createElement('div');
    list.className = 'dropdown-options-list';

    // Render Options Helper
    const renderOptions = (items) => {
      list.innerHTML = '';
      items.forEach(country => {
        const item = document.createElement('div');
        item.className = 'dropdown-option';
        item.dataset.value = country.countryCode;
        item.innerHTML = `
          <div class="option-left">
            <img src="https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png" alt="${country.name}" class="option-flag" loading="lazy">
            <span class="option-name">${country.name}</span>
          </div>
          <span class="option-code">${country.countryCode}</span>
        `;

        item.addEventListener('click', () => {
          // Select Action
          this.selectCustomOption(country, trigger, select, customDropdown);
        });

        list.appendChild(item);
      });
    };

    renderOptions(sortedCountries);

    menu.appendChild(searchContainer);
    menu.appendChild(list);
    customDropdown.appendChild(trigger);
    customDropdown.appendChild(menu);
    parent.appendChild(customDropdown);

    // 7. Event Listeners

    // Toggle
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');

      // Close all other dropdowns if any
      document.querySelectorAll('.custom-dropdown-menu.open').forEach(el => {
        if (el !== menu) {
          el.classList.remove('open');
          el.parentElement.querySelector('.custom-dropdown-trigger').classList.remove('active');
        }
      });

      menu.classList.toggle('open');
      trigger.classList.toggle('active');

      if (!isOpen) {
        searchInput.value = '';
        renderOptions(sortedCountries);
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = sortedCountries.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.countryCode.toLowerCase().includes(term)
      );
      renderOptions(filtered);
    });

    // Close on Outside Click
    document.addEventListener('click', (e) => {
      if (!customDropdown.contains(e.target)) {
        menu.classList.remove('open');
        trigger.classList.remove('active');
      }
    });

    // Handle existing selection if re-populating
    if (select.value) {
      const selected = sortedCountries.find(c => c.countryCode === select.value);
      if (selected) {
        trigger.querySelector('.selected-value').innerHTML = `
                <img src="https://flagcdn.com/w40/${selected.countryCode.toLowerCase()}.png" class="selected-flag">
                <span>${selected.name}</span>
            `;
      }
    }
  }

  selectCustomOption(country, trigger, select, container) {
    // Update Trigger UI
    trigger.querySelector('.selected-value').innerHTML = `
      <img src="https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png" class="selected-flag">
      <span>${country.name}</span>
    `;

    // Update Hidden Select
    select.value = country.countryCode;

    // Dispatch Change Event
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);

    // Close Menu
    container.querySelector('.custom-dropdown-menu').classList.remove('open');
    trigger.classList.remove('active');

    // Highlight Selected Option
    container.querySelectorAll('.dropdown-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.value === country.countryCode);
    });
  }

  populateCityDropdown(cities) {
    const select = this.elements.citySelect;
    select.innerHTML = '';

    if (!cities || cities.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No cities found';
      select.appendChild(option);
      return;
    }

    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });

    // Select first option by default
    if (select.options.length > 0) {
      select.selectedIndex = 0;
    }
  }

  toggleCitySelect(enable) {
    if (enable) {
      this.elements.citySelect.disabled = false;
      this.elements.citySelect.style.opacity = '1';
      this.elements.citySelect.style.cursor = 'pointer';
    } else {
      this.elements.citySelect.disabled = true;
      this.elements.citySelect.style.opacity = '0.6';
      this.elements.citySelect.style.cursor = 'not-allowed';
      this.elements.citySelect.innerHTML = '<option>Loading...</option>';
    }
  }

  getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  updateDashboardStats(stats) {
    if (stats.countries !== undefined) {
      document.getElementById('stat-countries').textContent = stats.countries;
    }
    if (stats.holidays !== undefined) {
      document.getElementById('stat-holidays').textContent = stats.holidays;
    }
    if (stats.events !== undefined) {
      document.getElementById('stat-events').textContent = stats.events; // Placeholder/Real
    }
    if (stats.saved !== undefined) {
      document.getElementById('stat-saved').textContent = stats.saved;
    }
  }

  updateCountryInfo(countryData, showDetails = false) {
    if (!countryData) return;
    console.log(countryData.capital ? countryData.capital[0] : 'N/A');
    // --- 1. Top Selection Display ---
    const selFlag = document.getElementById('selected-country-flag');
    const selName = document.getElementById('selected-country-name');
    const selCity = document.getElementById('selected-city-name');

    if (selFlag) selFlag.src = countryData.flags?.png || '';
    if (selName) selName.textContent = countryData.name?.common || 'Country';
    // If a city is selected in the global dropdown, use it; otherwise use Capital
    const cityVal = this.elements.citySelect.value;
    if (selCity) selCity.textContent = cityVal ? `• ${cityVal}` : (countryData.capital ? `• ${countryData.capital[0]}` : '');

    // Unhide the sections
    const selectedDestContainer = document.getElementById('selected-destination');
    if (selectedDestContainer) selectedDestContainer.classList.remove('hidden');

    const countryInfoSection = document.getElementById('dashboard-country-info-section');
    if (countryInfoSection) countryInfoSection.classList.remove('hidden');

    // Toggle Placeholder vs Details based on showDetails flag
    const infoContent = document.getElementById('dashboard-country-info');
    const placeholder = document.getElementById('country-info-placeholder');

    if (showDetails) {
      if (infoContent) infoContent.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    } else {
      if (infoContent) infoContent.classList.add('hidden');
      if (placeholder) placeholder.classList.remove('hidden');
    }

    // --- 2. Country Info Header ---
    const flagImg = document.querySelector('.dashboard-country-flag');
    const nameEl = document.querySelector('.dashboard-country-title h3');
    const officialNameEl = document.querySelector('.official-name');
    const regionEl = document.querySelector('.region');

    if (flagImg) {
      flagImg.src = countryData.flags?.png || '';
      flagImg.alt = countryData.name?.common || 'Country Flag';
    }
    if (nameEl) nameEl.textContent = countryData.name?.common || 'N/A';
    if (officialNameEl) officialNameEl.textContent = countryData.name?.official || 'N/A';
    if (regionEl) regionEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${countryData.region || ''} • ${countryData.subregion || ''}`;


    // Clear Button Logic
    const clearBtn = document.getElementById('clear-selection-btn');
    if (clearBtn) {
      // Remove existing listeners to prevent duplicates (simple CloneNode approach)
      const newBtn = clearBtn.cloneNode(true);
      clearBtn.parentNode.replaceChild(newBtn, clearBtn);

      newBtn.addEventListener('click', () => {
        this.clearSelection();
        // Also reset dashboard to initial state if needed
        this.renderWeather(null); // Clear weather or reset
        // Or just hide the main section
      });
    }

    // --- 3. Local Time (Approximate using first timezone) ---
    const timeDisplay = document.getElementById('country-local-time');
    const timeZoneDisplay = document.querySelector('.local-time-zone');
    if (timeDisplay && countryData.timezones && countryData.timezones.length > 0) {
      // Simple mock time update based on timezone offset could be complex. 
      // For now, let's just show the UTC offset string provided by API.
      // Or better, get current UTC time and apply offset.
      const tz = countryData.timezones[0]; // e.g., "UTC+02:00"
      timeZoneDisplay.textContent = tz;

      // Helper to calc time
      try {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

        // Parse offset "UTC+02:00" -> +2
        let offset = 0;
        if (tz !== 'UTC') {
          const modifier = tz.slice(3); // "+02:00"
          const sign = modifier.startsWith('-') ? -1 : 1;
          const [hours, mins] = modifier.substring(1).split(':').map(Number);
          offset = sign * (hours + (mins || 0) / 60);
        }

        const localTime = new Date(utc + (3600000 * offset));
        timeDisplay.textContent = localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch (e) {
        timeDisplay.textContent = '--:--:--';
      }
    }


    // --- 4. Grid Details ---
    // Get all detail boxes and update by index for reliability
    const detailBoxes = document.querySelectorAll('.dashboard-country-detail');

    // Capital (index 0)
    if (detailBoxes[0]) {
      const val = detailBoxes[0].querySelector('.value');
      if (val) val.textContent = countryData.capital ? countryData.capital[0] : 'N/A';
    }
    // Population (index 1)
    if (detailBoxes[1]) {
      const val = detailBoxes[1].querySelector('.value');
      if (val) val.textContent = countryData.population ? countryData.population.toLocaleString() : 'N/A';
    }
    // Area (index 2)
    if (detailBoxes[2]) {
      const val = detailBoxes[2].querySelector('.value');
      if (val) val.textContent = countryData.area ? `${countryData.area.toLocaleString()} km²` : 'N/A';
    }
    // Continent (index 3)
    if (detailBoxes[3]) {
      const val = detailBoxes[3].querySelector('.value');
      if (val) val.textContent = countryData.continents ? countryData.continents[0] : 'N/A';
    }
    // Calling Code (index 4)
    if (detailBoxes[4]) {
      const val = detailBoxes[4].querySelector('.value');
      let phone = 'N/A';
      if (countryData.idd) {
        const root = countryData.idd.root || '';
        const suffix = countryData.idd.suffixes && countryData.idd.suffixes.length >= 1 ? countryData.idd.suffixes[0] : '';
        phone = root + suffix;
      }
      if (val) val.textContent = phone;
    }
    // Driving Side (index 5)
    if (detailBoxes[5]) {
      const val = detailBoxes[5].querySelector('.value');
      if (val) val.textContent = countryData.car?.side ? (countryData.car.side.charAt(0).toUpperCase() + countryData.car.side.slice(1)) : 'N/A';
    }
    // Week Starts (index 6)
    if (detailBoxes[6]) {
      const val = detailBoxes[6].querySelector('.value');
      if (val) val.textContent = countryData.startOfWeek ? (countryData.startOfWeek.charAt(0).toUpperCase() + countryData.startOfWeek.slice(1)) : 'N/A';
    }


    // --- 5. Extra Sections (Currency, Language, Neighbors) ---
    const extraSections = document.querySelectorAll('.dashboard-country-extra');

    // Currency (index 0)
    if (extraSections[0]) {
      const container = extraSections[0].querySelector('.extra-tags');
      if (container) {
        container.innerHTML = '';
        if (countryData.currencies) {
          Object.values(countryData.currencies).forEach(curr => {
            const tag = document.createElement('span');
            tag.className = 'extra-tag';
            tag.textContent = `${curr.name} (${curr.symbol || ''})`;
            container.appendChild(tag);
          });
        } else {
          container.innerHTML = '<span class="extra-tag">N/A</span>';
        }
      }
    }

    // Languages (index 1)
    if (extraSections[1]) {
      const container = extraSections[1].querySelector('.extra-tags');
      if (container) {
        container.innerHTML = '';
        if (countryData.languages) {
          Object.values(countryData.languages).forEach(lang => {
            const tag = document.createElement('span');
            tag.className = 'extra-tag';
            tag.textContent = lang;
            container.appendChild(tag);
          });
        } else {
          container.innerHTML = '<span class="extra-tag">N/A</span>';
        }
      }
    }

    // Neighbors (index 2)
    if (extraSections[2]) {
      const container = extraSections[2].querySelector('.extra-tags');
      if (container) {
        container.innerHTML = '';
        if (countryData.borders && countryData.borders.length > 0) {
          countryData.borders.slice(0, 6).forEach(border => {
            const tag = document.createElement('span');
            tag.className = 'extra-tag border-tag';
            tag.textContent = border;
            container.appendChild(tag);
          });
        } else {
          container.innerHTML = '<span class="extra-tag">None (Island/Isolated)</span>';
        }
      }
    }

    // Map Button
    const mapBtn = document.querySelector('.btn-map-link');
    if (mapBtn && countryData.maps?.googleMaps) {
      mapBtn.href = countryData.maps.googleMaps;
    }
  }

  switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`${viewId}-view`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Active nav item
    const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }
  }

  renderHolidays(holidays, year, countryName) {
    const container = document.getElementById('holidays-content');
    container.innerHTML = ''; // Clear static content

    if (holidays.length === 0) {
      container.innerHTML = '<p>No holidays found.</p>';
      return;
    }

    holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const dayName = date.toLocaleString('default', { weekday: 'long' });

      const card = document.createElement('div');
      card.className = 'holiday-card';
      card.innerHTML = `
                <div class="holiday-card-header">
                    <div class="holiday-date-box"><span class="day">${day}</span><span class="month">${month}</span></div>
                    <button class="holiday-action-btn" data-id="${holiday.date}-${holiday.countryCode}" data-title="${holiday.name}" data-date="${holiday.date}" data-type="holiday" data-extra="${holiday.localName || holiday.name}"><i class="fa-regular fa-heart"></i></button>
                </div>
                <h3>${holiday.name}</h3>
                <p class="holiday-name">${holiday.localName || holiday.name}</p>
                <div class="holiday-card-footer">
                    <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${dayName}</span>
                    <span class="holiday-type-badge">${holiday.types ? holiday.types[0] : 'Public'}</span>
                </div>
            `;
      container.appendChild(card);
    });

    // Update header selection info
    // Note: Assuming elements exist, might need to be more robust
    const badge = document.querySelector('#holidays-selection .current-selection-badge');
    if (badge) {
      badge.querySelector('span:nth-child(2)').textContent = countryName;
      badge.querySelector('.selection-year').textContent = year;
    }
  }

  renderEvents(events) {
    // Store events for filtering
    this.currentEvents = events || [];

    const container = document.getElementById('events-content');
    container.innerHTML = '';

    if (!events || events.length === 0) {
      container.innerHTML = '<p>No events found.</p>';
      return;
    }

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
                <div class="event-card-image">
                    <img src="${event.image}" alt="${event.name}">
                    <span class="event-card-category">${event.category}</span>
                    <button class="event-card-save" data-id="${event.id}" data-title="${event.name}" data-date="${event.date}" data-type="event" data-extra="${event.location}"><i class="fa-regular fa-heart"></i></button>
                </div>
                <div class="event-card-body">
                    <h3>${event.name}</h3>
                    <div class="event-card-info">
                        <div><i class="fa-regular fa-calendar"></i> ${new Date(event.date).toDateString()}</div>
                        <div><i class="fa-solid fa-location-dot"></i> ${event.location}</div>
                    </div>
                    <div class="event-card-footer">
                        <button class="btn-event" data-id="${event.id}" data-title="${event.name}" data-date="${event.date}" data-type="event" data-extra="${event.location}"><i class="fa-regular fa-heart"></i> Save</button>
                    </div>
                </div>
            `;
      container.appendChild(card);
    });
  }

  renderWeather(weatherData, city) {
    const container = document.getElementById('weather-content');
    if (!container) return;

    if (!weatherData || !weatherData.current || !weatherData.daily) {
      container.innerHTML = '<div class="empty-state"><p>Weather data unavailable</p></div>';
      return;
    }

    const current = weatherData.current;
    const daily = weatherData.daily;

    // Weather code to description and icon mapping
    const getWeatherInfo = (code) => {
      if (code === 0) return { icon: 'fa-sun', desc: 'Clear sky', type: 'weather-sunny' };
      if (code <= 3) return { icon: 'fa-cloud-sun', desc: 'Partly cloudy', type: 'weather-cloudy' };
      if (code <= 49) return { icon: 'fa-cloud', desc: 'Cloudy', type: 'weather-cloudy' };
      if (code <= 59) return { icon: 'fa-cloud-rain', desc: 'Light rain', type: 'weather-rainy' };
      if (code <= 69) return { icon: 'fa-cloud-showers-heavy', desc: 'Rain', type: 'weather-rainy' };
      if (code <= 79) return { icon: 'fa-snowflake', desc: 'Snow', type: 'weather-snowy' };
      if (code <= 99) return { icon: 'fa-cloud-bolt', desc: 'Thunderstorm', type: 'weather-stormy' };
      return { icon: 'fa-cloud', desc: 'Cloudy', type: 'weather-default' };
    };

    const currentWeather = getWeatherInfo(current.weather_code);
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // Generate hourly forecast (simulate from daily data)
    let hourlyHTML = '';
    const hours = ['Now', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM'];

    for (let i = 0; i < 20; i++) {
      const isNow = i === 0;
      const temp = Math.round(current.temperature_2m + (Math.random() * 4 - 2));
      const icon = currentWeather.icon;
      const precip = Math.floor(Math.random() * 40);

      hourlyHTML += `
        <div class="hourly-item ${isNow ? 'now' : ''}">
          <span class="hourly-time">${hours[i]}</span>
          <div class="hourly-icon"><i class="fa-solid ${icon}"></i></div>
          <span class="hourly-temp">${temp}°</span>
          <div class="hourly-precip"><i class="fa-solid fa-droplet"></i> ${precip}%</div>
        </div>
      `;
    }

    // Generate 7-day forecast HTML
    let forecastHTML = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(daily.time[i]);
      const dayName = i === 0 ? 'TODAY' : date.toLocaleString('default', { weekday: 'short' }).toUpperCase();
      const dayDate = date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' });
      const icon = getWeatherInfo(daily.weather_code[i]).icon;
      const precip = Math.floor(Math.random() * 50);

      forecastHTML += `
        <div class="forecast-day ${i === 0 ? 'today' : ''}">
          <div class="forecast-day-name">
            <span class="day-label">${dayName}</span>
            <span class="day-date">${dayDate}</span>
          </div>
          <div class="forecast-icon"><i class="fa-solid ${icon}"></i></div>
          <div class="forecast-temps">
            <span class="temp-max">${Math.round(daily.temperature_2m_max[i])}°</span>
            <span class="temp-min">${Math.round(daily.temperature_2m_min[i])}°</span>
          </div>
          <div class="forecast-precip"><i class="fa-solid fa-droplet"></i> ${precip}%</div>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Weather Hero Card -->
      <div class="weather-hero-card ${currentWeather.type}">
        <div class="weather-hero-bg"></div>
        <div class="weather-hero-content">
          <div class="weather-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${city || 'Current Location'}</span>
            <span class="weather-time">${dateStr}</span>
          </div>
          <div class="weather-hero-main">
            <div class="weather-hero-left">
              <div class="weather-hero-icon">
                <i class="fa-solid ${currentWeather.icon}"></i>
              </div>
              <div class="weather-hero-temp">
                <span class="temp-value">${Math.round(current.temperature_2m)}</span>
                <span class="temp-unit">°C</span>
              </div>
            </div>
            <div class="weather-hero-right">
              <div class="weather-condition">${currentWeather.desc}</div>
              <div class="weather-feels">Feels like ${Math.round(current.temperature_2m - 2)}°C</div>
              <div class="weather-high-low">
                <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(daily.temperature_2m_max[0])}°</span>
                <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(daily.temperature_2m_min[0])}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weather Details Grid -->
      <div class="weather-details-grid">
        <div class="weather-detail-card">
          <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
          <div class="detail-info">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">${current.relative_humidity_2m}%</span>
          </div>
        </div>
        <div class="weather-detail-card">
          <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
          <div class="detail-info">
            <span class="detail-label">Wind</span>
            <span class="detail-value">${current.wind_speed_10m} km/h</span>
          </div>
          <span class="detail-extra">N</span>
        </div>
        <div class="weather-detail-card">
          <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
          <div class="detail-info">
            <span class="detail-label">UV Index</span>
            <span class="detail-value">6</span>
          </div>
          <span class="uv-level high">High</span>
        </div>
        <div class="weather-detail-card">
          <div class="detail-icon precip"><i class="fa-solid fa-cloud-rain"></i></div>
          <div class="detail-info">
            <span class="detail-label">Precipitation</span>
            <span class="detail-value">33%</span>
          </div>
          <span class="detail-extra">1.8mm expected</span>
        </div>
        <div class="weather-detail-card sunrise-sunset">
          <div class="sun-times-visual">
            <div class="sun-time sunrise">
              <i class="fa-solid fa-circle"></i>
              <span class="sun-label">Sunrise</span>
              <span class="sun-value">${daily.sunrise ? new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '06:53 AM'}</span>
            </div>
            <div class="sun-arc">
              <div class="sun-arc-path"></div>
            </div>
            <div class="sun-time sunset">
              <i class="fa-solid fa-moon"></i>
              <span class="sun-label">Sunset</span>
              <span class="sun-value">${daily.sunset ? new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '05:51 PM'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Hourly Forecast -->
      <div class="weather-section">
        <div class="weather-section-title">
          <i class="fa-solid fa-clock"></i>
          Hourly Forecast
        </div>
        <div class="hourly-scroll">
          ${hourlyHTML}
        </div>
      </div>

      <!-- 7-Day Forecast -->
      <div class="weather-section">
        <div class="weather-section-title">
          <i class="fa-solid fa-calendar-days"></i>
          7-Day Forecast
        </div>
        <div class="forecast-list">
          ${forecastHTML}
        </div>
      </div>
    `;
  }

  renderLongWeekends(weekends, year) {
    const container = document.getElementById('lw-content');
    container.innerHTML = '';

    // Header
    const headerBadge = document.querySelector('#long-weekends-view .current-selection-badge');
    if (headerBadge) {
      headerBadge.querySelector('.selection-year').textContent = year;
    }

    if (!weekends || weekends.length === 0) {
      container.innerHTML = '<p>No long weekends found.</p>';
      return;
    }

    weekends.forEach((lw, index) => {
      const startDate = new Date(lw.startDate);
      const endDate = new Date(lw.endDate);

      // Format dates
      const startStr = startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString('default', { month: 'short', day: 'numeric' });

      const card = document.createElement('div');
      card.className = 'lw-card';

      // Simple logic for "status" based on needBridgeDay
      const statusClass = lw.needBridgeDay ? 'warning' : 'success';
      const statusIcon = lw.needBridgeDay ? 'fa-info-circle' : 'fa-check-circle';
      const statusText = lw.needBridgeDay ? 'Requires bridge day' : 'No extra days off needed!';

      card.innerHTML = `
        <div class="lw-card-header">
          <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${lw.dayCount} Days</span>
          <button class="holiday-action-btn" data-id="lw-${index}-${year}" data-title="Long Weekend #${index + 1}" data-date="${startStr} - ${endStr}" data-type="longweekend" data-extra="${statusText}"><i class="fa-regular fa-heart"></i></button>
        </div>
        <h3>Long Weekend #${index + 1}</h3>
        <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${startStr} - ${endStr}, ${year}</div>
        <div class="lw-info-box ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${statusText}</div>
      `;
      container.appendChild(card);
    });
  }

  renderSunTimes(data, city) {
    if (!data || !data.results) return;

    const times = data.results;

    // Helper to formatting UTC ISO to local time string is tricky without timezone.
    // The API returns UTC if formatted=0. To keep it simple, let's just display the raw time or basic parse.
    // Ideally we use a library or simply .toLocaleTimeString if we had the timezone offset.
    // For this demo, let's just format the time part of the ISO string.

    const formatTime = (isoString) => {
      if (!isoString) return '--:--';
      return new Date(isoString).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
    };

    // Header
    const headerBadge = document.querySelector('#sun-times-view .current-selection-badge');
    if (headerBadge) headerBadge.querySelector('.selection-city').textContent = `• ${city} `;

    const mainCard = document.querySelector('.sun-main-card');
    if (mainCard) {
      mainCard.querySelector('.sun-location h2').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city}`;
      mainCard.querySelector('.sun-date-display .date').textContent = new Date().toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });

      // Cards
      const updateCard = (cls, time, label) => {
        const el = mainCard.querySelector(`.sun-time-card.${cls}`);
        if (el) {
          el.querySelector('.time').textContent = formatTime(time);
          if (label) el.querySelector('.label').textContent = label;
        }
      };

      updateCard('sunrise', times.sunrise);
      updateCard('sunset', times.sunset);
      updateCard('noon', times.solar_noon);
      updateCard('porn', times.civil_twilight_begin, 'Dawn'); // dawn matches civil begin
      updateCard('dusk', times.civil_twilight_end);

      // Day Length
      const dayLengthEl = document.querySelector('.day-stat .value');
      // API returns day_length in seconds (number) or string depending on version. 
      // Docs say `day_length`: "13:00:00" usually. 
      // But with formatted=0 it might be seconds. Let's check docs or safe handle.
      // If we use formatted=0, it returns seconds as numbers sometimes? 
      // Actually sunrise-sunset.org `formatted = 0` returns ISO8601 strings. 
      // `day_length` is usually in seconds.

      if (times.day_length) {
        const hours = Math.floor(times.day_length / 3600);
        const mins = Math.floor((times.day_length % 3600) / 60);
        if (dayLengthEl) dayLengthEl.textContent = `${hours}h ${mins}m`;

        // Progress bar
        const percent = (times.day_length / 86400) * 100;
        const fill = document.querySelector('.day-progress-fill');
        if (fill) fill.style.width = `${percent}%`;
      }
    }
  }

  renderSavedPlans(plans) {
    const container = document.getElementById('plans-content');
    container.innerHTML = '';

    if (plans.length === 0) {
      container.innerHTML = `
      < div class="empty-state" >
                <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
                <h3>No Saved Plans Yet</h3>
                <p>Start exploring and save holidays, events, or long weekends you like!</p>
              </div > `;
      return;
    }

    plans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'plan-card';

      // Design Configuration based on Type
      let badgeText = 'PLAN';
      let badgeClass = 'badge-other';
      let icon = 'fa-star';
      let infoIcon = 'fa-info-circle';
      let infoText = plan.extra || plan.location || 'Saved Item';

      if (plan.type === 'holiday') {
        badgeText = 'HOLIDAY';
        badgeClass = 'badge-holiday'; // Green
        icon = 'fa-calendar-days'; // Though design shows no icon in body, mockup has no icon. Just badge.
        infoText = plan.extra || 'Public Holiday';
      } else if (plan.type === 'longweekend') {
        badgeText = 'LONG WEEKEND';
        badgeClass = 'badge-longweekend'; // Orange
        infoText = plan.extra || 'Bridge Day Status';
      } else if (plan.type === 'event') {
        badgeText = 'EVENT';
        badgeClass = 'badge-event'; // Purple
        infoIcon = 'fa-location-dot';
        // infoText should be location/venue
      }

      card.innerHTML = `
        <div class="plan-card-header">
           <span class="plan-badge ${badgeClass}">${badgeText}</span>
        </div>
        
        <div class="plan-card-body">
            <h3 class="plan-title" title="${plan.title}">${plan.title}</h3>
            
            <div class="plan-date">
              <i class="fa-regular fa-calendar"></i>
              <span>${plan.date || 'No Date'}</span>
            </div>
            
            <div class="plan-info">
              <i class="fa-solid ${infoIcon}"></i>
              <span>${infoText}</span>
            </div>
        </div>

        <button class="plan-remove-btn" data-id="${plan.id}">
            <i class="fa-solid fa-trash"></i> Remove
        </button>
      `;
      container.appendChild(card);
    });

    // Event delegation handling is in main.js

    // Update counts
    const countBadge = document.getElementById('plans-count');
    if (countBadge) {
      countBadge.textContent = plans.length;
      countBadge.classList.remove('hidden');
    }
  }

  updateFilterCounts(counts) {
    const update = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    update('filter-all-count', counts.all);
    update('filter-holiday-count', counts.holiday);
    update('filter-event-count', counts.event);
    update('filter-lw-count', counts.longweekend);
  }

  setActiveFilter(filter) {
    document.querySelectorAll('.plan-filter').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${message}</span>
      <button class="toast-close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    // Add to container
    container.appendChild(toast);

    // Auto remove after 3 seconds
    const timeout = setTimeout(() => {
      removeToast();
    }, 3000);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(timeout);
      removeToast();
    });

    function removeToast() {
      toast.style.animation = 'slideIn 0.3s ease reverse forwards';
      toast.addEventListener('animationend', () => {
        if (toast.parentNode) {
          toast.remove();
        }
      });
    }
  }
}
