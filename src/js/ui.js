export class UIManager {
  constructor() {
    this.elements = {
      countrySelect: document.getElementById('global-country'),
      citySelect: document.getElementById('global-city'),
      yearSelect: document.getElementById('global-year'),
      searchBtn: document.getElementById('global-search-btn'),
    };

    this.initClock();
  }

  initClock() {
    const updateClock = () => {
      const datetimeEl = document.getElementById('current-datetime');
      if (datetimeEl) {
        const now = new Date();
        const options = {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        datetimeEl.textContent = now.toLocaleString('en-US', options);
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  populateCountryDropdown(countries) {
    const select = this.elements.countrySelect;

    select.style.display = 'none';

    const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));

    select.innerHTML = '<option value="">Select Country</option>';
    sortedCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.countryCode;
      option.textContent = country.name;
      select.appendChild(option);
    });

    const parent = select.parentNode;
    let customDropdown = parent.querySelector('.custom-dropdown');

    if (customDropdown) {
      customDropdown.remove();
    }

    customDropdown = document.createElement('div');
    customDropdown.className = 'custom-dropdown';

    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';
    trigger.innerHTML = `
      <div class="selected-value">
        <span>Select Country</span>
      </div>
      <i class="fa-solid fa-chevron-down"></i>
    `;

    const menu = document.createElement('div');
    menu.className = 'custom-dropdown-menu';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'dropdown-search-container';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dropdown-search-input';
    searchInput.placeholder = 'Search countries...';
    searchContainer.appendChild(searchInput);

    const list = document.createElement('div');
    list.className = 'dropdown-options-list';

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

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');

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

    document.addEventListener('click', (e) => {
      if (!customDropdown.contains(e.target)) {
        menu.classList.remove('open');
        trigger.classList.remove('active');
      }
    });

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
    trigger.querySelector('.selected-value').innerHTML = `
      <img src="https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png" class="selected-flag">
      <span>${country.name}</span>
    `;

    select.value = country.countryCode;
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);

    container.querySelector('.custom-dropdown-menu').classList.remove('open');
    trigger.classList.remove('active');

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
      document.getElementById('stat-events').textContent = stats.events;
    }
    if (stats.saved !== undefined) {
      document.getElementById('stat-saved').textContent = stats.saved;
    }
  }

  updateCountryInfo(countryData, showDetails = false) {
    if (!countryData) return;
    console.log(countryData.capital ? countryData.capital[0] : 'N/A');
    const selFlag = document.getElementById('selected-country-flag');
    const selName = document.getElementById('selected-country-name');
    const selCity = document.getElementById('selected-city-name');

    if (selFlag) selFlag.src = countryData.flags?.png || '';
    if (selName) selName.textContent = countryData.name?.common || 'Country';
    const cityVal = this.elements.citySelect.value;
    if (selCity) selCity.textContent = cityVal ? `• ${cityVal}` : (countryData.capital ? `• ${countryData.capital[0]}` : '');

    const selectedDestContainer = document.getElementById('selected-destination');
    if (selectedDestContainer) selectedDestContainer.classList.remove('hidden');

    const countryInfoSection = document.getElementById('dashboard-country-info-section');
    if (countryInfoSection) countryInfoSection.classList.remove('hidden');

    const infoContent = document.getElementById('dashboard-country-info');
    const placeholder = document.getElementById('country-info-placeholder');

    if (showDetails) {
      if (infoContent) infoContent.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    } else {
      if (infoContent) infoContent.classList.add('hidden');
      if (placeholder) placeholder.classList.remove('hidden');
    }

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

    const clearBtn = document.getElementById('clear-selection-btn');
    if (clearBtn) {
      const newBtn = clearBtn.cloneNode(true);
      clearBtn.parentNode.replaceChild(newBtn, clearBtn);

      newBtn.addEventListener('click', () => {
        this.clearSelection();
        this.renderWeather(null);
      });
    }

    const timeDisplay = document.getElementById('country-local-time');
    const timeZoneDisplay = document.querySelector('.local-time-zone');
    if (timeDisplay && countryData.timezones && countryData.timezones.length > 0) {
      const tz = countryData.timezones[0];
      timeZoneDisplay.textContent = tz;

      try {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

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

    const detailBoxes = document.querySelectorAll('.dashboard-country-detail');
    if (detailBoxes[0]) {
      const val = detailBoxes[0].querySelector('.value');
      if (val) val.textContent = countryData.capital ? countryData.capital[0] : 'N/A';
    }
    if (detailBoxes[1]) {
      const val = detailBoxes[1].querySelector('.value');
      if (val) val.textContent = countryData.population ? countryData.population.toLocaleString() : 'N/A';
    }
    if (detailBoxes[2]) {
      const val = detailBoxes[2].querySelector('.value');
      if (val) val.textContent = countryData.area ? `${countryData.area.toLocaleString()} km²` : 'N/A';
    }
    if (detailBoxes[3]) {
      const val = detailBoxes[3].querySelector('.value');
      if (val) val.textContent = countryData.continents ? countryData.continents[0] : 'N/A';
    }
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
    if (detailBoxes[5]) {
      const val = detailBoxes[5].querySelector('.value');
      if (val) val.textContent = countryData.car?.side ? (countryData.car.side.charAt(0).toUpperCase() + countryData.car.side.slice(1)) : 'N/A';
    }
    if (detailBoxes[6]) {
      const val = detailBoxes[6].querySelector('.value');
      if (val) val.textContent = countryData.startOfWeek ? (countryData.startOfWeek.charAt(0).toUpperCase() + countryData.startOfWeek.slice(1)) : 'N/A';
    }

    const extraSections = document.querySelectorAll('.dashboard-country-extra');
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
    const mapBtn = document.querySelector('.btn-map-link');
    if (mapBtn && countryData.maps?.googleMaps) {
      mapBtn.href = countryData.maps.googleMaps;
    }
  }

  switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });
    const targetView = document.getElementById(`${viewId}-view`);
    if (targetView) {
      targetView.classList.add('active');
    }

    const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }
  }

  renderHolidays(holidays, year, countryName) {
    const container = document.getElementById('holidays-content');
    container.innerHTML = '';

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

    const badge = document.querySelector('#holidays-selection .current-selection-badge');
    if (badge) {
      badge.querySelector('span:nth-child(2)').textContent = countryName;
      badge.querySelector('.selection-year').textContent = year;
    }
  }

  renderEvents(events) {
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
                    <span class="event-card-category">Event</span>
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

  filterEvents(category) {
    const filters = document.querySelectorAll('.event-filter');
    filters.forEach(f => {
      if (f.dataset.category === category) f.classList.add('active');
      else f.classList.remove('active');
    });

    const container = document.getElementById('events-content');
    if (!container) return;

    container.innerHTML = '';

    const filtered = category === 'all'
      ? this.currentEvents
      : this.currentEvents.filter(e => {
        const cat = e.category?.toLowerCase() || '';
        const search = category.toLowerCase();
        return cat.includes(search) || search.includes(cat);
      });

    if (!filtered || filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No events found for this category.</p></div>';
      return;
    }

    filtered.forEach(event => {
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

      const startStr = startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString('default', { month: 'short', day: 'numeric' });

      const card = document.createElement('div');
      card.className = 'lw-card';

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

    const formatTime = (isoString) => {
      if (!isoString) return '--:--';
      return new Date(isoString).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
    };

    const headerBadge = document.querySelector('#sun-times-view .current-selection-badge');
    if (headerBadge) headerBadge.querySelector('.selection-city').textContent = `• ${city} `;

    const mainCard = document.querySelector('.sun-main-card');
    if (mainCard) {
      mainCard.querySelector('.sun-location h2').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city}`;
      mainCard.querySelector('.sun-date-display .date').textContent = new Date().toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });

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
      updateCard('porn', times.civil_twilight_begin, 'Dawn');
      updateCard('dusk', times.civil_twilight_end);

      const dayLengthEl = document.querySelector('.day-stat .value');
      if (times.day_length) {
        const hours = Math.floor(times.day_length / 3600);
        const mins = Math.floor((times.day_length % 3600) / 60);
        if (dayLengthEl) dayLengthEl.textContent = `${hours}h ${mins}m`;
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

      let badgeText = 'PLAN';
      let badgeClass = 'badge-other';
      let icon = 'fa-star';
      let infoIcon = 'fa-info-circle';
      let infoText = plan.extra || plan.location || 'Saved Item';

      if (plan.type === 'holiday') {
        badgeText = 'HOLIDAY';
        badgeClass = 'badge-holiday';
        icon = 'fa-calendar-days';
        infoText = plan.extra || 'Public Holiday';
      } else if (plan.type === 'longweekend') {
        badgeText = 'LONG WEEKEND';
        badgeClass = 'badge-longweekend';
        infoText = plan.extra || 'Bridge Day Status';
      } else if (plan.type === 'event') {
        badgeText = 'EVENT';
        badgeClass = 'badge-event';
        infoIcon = 'fa-location-dot';
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

    container.appendChild(toast);

    const timeout = setTimeout(() => {
      removeToast();
    }, 3000);

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

  showLoader(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    if (overlay) {
      if (text) text.textContent = message;
      overlay.classList.remove('hidden');
    }
  }

  hideLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  updateAllViewBadges(countryData, city, year) {
    const countryName = countryData?.name?.common || 'Unknown';
    const countryCode = countryData?.cca2?.toLowerCase() || '';
    const flagUrl = `https://flagcdn.com/w40/${countryCode}.png`;

    // Get all view badges
    const badges = document.querySelectorAll('.current-selection-badge');
    badges.forEach(badge => {
      const flag = badge.querySelector('.selection-flag');
      const nameSpan = badge.querySelector('span:not(.selection-city):not(.selection-year)');
      const citySpan = badge.querySelector('.selection-city');
      const yearSpan = badge.querySelector('.selection-year');

      if (flag) {
        flag.src = flagUrl;
        flag.alt = countryName;
      }
      if (nameSpan) nameSpan.textContent = countryName;
      if (citySpan) citySpan.textContent = `• ${city}`;
      if (yearSpan) yearSpan.textContent = year;
    });
  }
}
