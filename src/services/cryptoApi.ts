import { CryptoCurrency, MarketData, CoinDetail } from '../types/crypto';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const cryptoApi = {
  async getTopCryptos(page: number = 1, perPage: number = 100): Promise<CryptoCurrency[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      throw error;
    }
  },

  async getCoinDetail(coinId: string): Promise<CoinDetail> {
    try {
      const response = await fetch(
        `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch coin detail');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching coin detail:', error);
      throw error;
    }
  },

  async getMarketChart(coinId: string, days: number = 7): Promise<MarketData> {
    try {
      const response = await fetch(
        `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days === 1 ? 'hourly' : 'daily'}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch market chart data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching market chart:', error);
      throw error;
    }
  },

  async searchCoins(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/search?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search coins');
      }
      
      const data = await response.json();
      return data.coins;
    } catch (error) {
      console.error('Error searching coins:', error);
      throw error;
    }
  }
};