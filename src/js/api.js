import { CONFIG } from './config.js';

export class APIManager {
  constructor() {
    this.baseUrl = 'https://date.nager.at/api/v3';
  }

  async fetchLongWeekends(year, countryCode) {
    try {
      const response = await fetch(`${this.baseUrl}/LongWeekend/${year}/${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch long weekends');
      return await response.json();
    } catch (error) {
      console.error('Error fetching long weekends:', error);
      return [];
    }
  }

  async fetchSunTimes(lat, lng) {
    try {
      const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`);
      if (!response.ok) throw new Error('Failed to fetch sun times');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sun times:', error);
      return null;
    }
  }

  async fetchExchangeRates(baseCurrency = 'USD') {
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch rates');
      return await response.json();
    } catch (error) {
      console.error('Error fetching rates:', error);
      return null;
    }
  }

  async fetchCountries() {
    try {
      const response = await fetch(`${this.baseUrl}/AvailableCountries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }

  async fetchHolidays(year, countryCode) {
    try {
      const response = await fetch(`${this.baseUrl}/PublicHolidays/${year}/${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch holidays');
      return await response.json();
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }
  }

  async fetchCountryDetails(countryCode) {
    try {
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch country details');
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error('Error fetching country details:', error);
      return {};
    }
  }

  async fetchEvents(city, countryCode) {
    const apiKey = CONFIG.TICKETMASTER_API_KEY;
    try {
      const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${encodeURIComponent(city)}&countryCode=${countryCode}&size=20&sort=date,asc`);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Ticketmaster API Key missing or invalid. Using mock data.');
          return this.getMockEvents(city);
        }
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      if (!data._embedded || !data._embedded.events) return this.getMockEvents(city);

      return data._embedded.events.map(event => {
        let category = 'Event';
        if (event.classifications && event.classifications.length > 0) {
          const classification = event.classifications[0];
          category = classification.segment?.name || classification.genre?.name || classification.subGenre?.name || 'Event';
        }

        let imageUrl = 'https://via.placeholder.com/400x200?text=No+Image';
        if (event.images && event.images.length > 0) {
          const preferred = event.images.find(img => img.ratio === '16_9' && img.width >= 500);
          imageUrl = preferred ? preferred.url : event.images[0].url;
        }

        let location = city || 'Unknown Venue';
        if (event._embedded?.venues?.[0]?.name) {
          location = event._embedded.venues[0].name;
        } else if (event.place?.city?.name) {
          location = event.place.city.name;
        }

        return {
          id: event.id,
          name: event.name,
          date: event.dates?.start?.localDate || 'TBD',
          image: imageUrl,
          category: category,
          location: location
        };
      });

    } catch (error) {
      console.error('Error fetching events:', error);
      console.warn('Using mock event data due to API error (CORS or network issue).');
      return this.getMockEvents(city);
    }
  }

  getMockEvents(city) {
    return [
      { id: 'mock-1', name: 'Summer Music Festival', date: '2026-03-15', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', category: 'Music', location: city || 'Local Venue' },
      { id: 'mock-2', name: 'International Football Match', date: '2026-04-02', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400', category: 'Sports', location: city || 'Stadium' },
      { id: 'mock-3', name: 'Broadway: The Lion King', date: '2026-03-20', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400', category: 'Arts & Theatre', location: city || 'Grand Theatre' },
      { id: 'mock-4', name: 'Family Fun Carnival', date: '2026-05-01', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400', category: 'Family', location: city || 'City Park' },
      { id: 'mock-5', name: 'Jazz Night Live', date: '2026-03-28', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400', category: 'Music', location: city || 'Jazz Club' },
      { id: 'mock-6', name: 'Basketball Championship', date: '2026-04-10', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400', category: 'Sports', location: city || 'Arena' },
    ];
  }

  async fetchWeather(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch weather');
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }
}