import { CONFIG } from './config.js';

export class APIManager {
  constructor() {
    this.baseUrl = 'https://date.nager.at/api/v3'; // Example API base URL, will need adjustment based on docs
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
      // using sunrise-sunset.org
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
      // Using open.er-api.com which is free and doesn't require key, compatible with ExchangeRate-API response structure
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

  async fetchEvents(city) {
    const apiKey = CONFIG.TICKETMASTER_API_KEY;
    try {
      // Using Ticketmaster Discovery API
      // segmentId KZFzniwnSyZfZ7v7nJ = Music
      const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&size=10&sort=date,asc`);

      if (!response.ok) {
        // If 401/403 (likely due to missing key), throw specific error or return empty
        if (response.status === 401 || response.status === 403) {
          console.warn('Ticketmaster API Key missing or invalid.');
          return [];
        }
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      if (!data._embedded || !data._embedded.events) return [];

      return data._embedded.events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.dates.start.localDate,
        image: event.images && event.images.length > 0 ? event.images[0].url : 'https://via.placeholder.com/400x200?text=No+Image',
        category: event.classifications && event.classifications.length > 0 ? event.classifications[0].segment.name : 'Event',
        location: event._embedded && event._embedded.venues && event._embedded.venues.length > 0 ? event._embedded.venues[0].name : city
      }));

    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
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