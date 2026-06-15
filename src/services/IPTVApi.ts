import { UserCredentials, Category, Channel, Movie, Serie } from '../types';

export class IPTVApi {
  private credentials: UserCredentials;

  constructor(credentials: UserCredentials) {
    this.credentials = credentials;
  }

  private getBaseUrl(): string {
    return this.credentials.url.replace(/\/$/, '');
  }

  private getAuthParams(): string {
    return `username=${encodeURIComponent(this.credentials.username)}&password=${encodeURIComponent(this.credentials.password)}`;
  }

  async getLiveCategories(): Promise<Category[]> {
    try {
      const url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_live_categories`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return data.map((cat: any) => ({
        id: cat.category_id || String(Math.random()),
        name: cat.category_name || 'Sem nome',
        channels: [],
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getMockCategories();
    }
  }

  async getLiveStreams(categoryId?: string): Promise<Channel[]> {
    try {
      let url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_live_streams`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return data.map((stream: any) => ({
        id: stream.stream_id || String(Math.random()),
        name: stream.name || 'Canal sem nome',
        logo: stream.stream_icon || undefined,
        group: stream.category_id || undefined,
        url: `${this.getBaseUrl()}/${this.credentials.username}/${this.credentials.password}/${stream.stream_id}.ts`,
      }));
    } catch (error) {
      console.error('Error fetching streams:', error);
      return this.getMockChannels(categoryId);
    }
  }

  async getAllChannels(): Promise<Category[]> {
    try {
      const categories = await this.getLiveCategories();
      
      // Fetch channels for each category
      const categoriesWithChannels = await Promise.all(
        categories.map(async (category) => {
          const channels = await this.getLiveStreams(category.id);
          return {
            ...category,
            channels,
          };
        })
      );

      // Filter out empty categories
      return categoriesWithChannels.filter(cat => cat.channels.length > 0);
    } catch (error) {
      console.error('Error fetching all channels:', error);
      return this.getMockCategories();
    }
  }

  getStreamUrl(streamId: string, extension: string = 'ts'): string {
    return `${this.getBaseUrl()}/live/${this.credentials.username}/${this.credentials.password}/${streamId}.${extension}`;
  }

  // ==================== VOD MOVIES ====================
  
  async getVodCategories(): Promise<Category[]> {
    try {
      const url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_vod_categories`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return data.map((cat: any) => ({
        id: cat.category_id || String(Math.random()),
        name: cat.category_name || 'Sem nome',
        channels: [],
      }));
    } catch (error) {
      console.error('Error fetching VOD categories:', error);
      return [];
    }
  }

  async getVodStreams(categoryId?: string): Promise<Movie[]> {
    try {
      let url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_vod_streams`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return data.map((movie: any) => ({
        id: movie.stream_id || String(Math.random()),
        name: movie.name || 'Filme sem nome',
        logo: movie.stream_icon || undefined,
        category: movie.category_id || undefined,
        url: `${this.getBaseUrl()}/movie/${this.credentials.username}/${this.credentials.password}/${movie.stream_id}.${movie.container_extension || 'mp4'}`,
        rating: movie.rating,
        duration: movie.duration,
        plot: movie.plot,
        cast: movie.cast,
        director: movie.director,
        year: movie.year,
      }));
    } catch (error) {
      console.error('Error fetching VOD streams:', error);
      return [];
    }
  }

  // ==================== SERIES ====================
  
  async getSeriesCategories(): Promise<Category[]> {
    try {
      const url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_series_categories`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return data.map((cat: any) => ({
        id: cat.category_id || String(Math.random()),
        name: cat.category_name || 'Sem nome',
        channels: [],
      }));
    } catch (error) {
      console.error('Error fetching series categories:', error);
      return [];
    }
  }

  async getSeries(categoryId?: string): Promise<Serie[]> {
    try {
      let url = `${this.getBaseUrl()}/player_api.php?${this.getAuthParams()}&action=get_series`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return data.map((serie: any) => ({
        id: serie.series_id || String(Math.random()),
        name: serie.name || 'Série sem nome',
        logo: serie.cover || serie.backdrop_path || undefined,
        category: serie.category_id || undefined,
        rating: serie.rating,
        plot: serie.plot,
        cast: serie.cast,
        director: serie.director,
        year: serie.year,
        episodes: [],
      }));
    } catch (error) {
      console.error('Error fetching series:', error);
      return [];
    }
  }

  // Mock data for fallback
  private getMockCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Esportes',
        channels: this.getMockChannels('1'),
      },
      {
        id: '2',
        name: 'Notícias',
        channels: this.getMockChannels('2'),
      },
      {
        id: '3',
        name: 'Entretenimento',
        channels: this.getMockChannels('3'),
      },
    ];
  }

  private getMockChannels(categoryId?: string): Channel[] {
    const mockChannels: Channel[] = [
      { id: '1', name: 'ESPN', logo: '', url: '' },
      { id: '2', name: 'Fox Sports', logo: '', url: '' },
      { id: '3', name: 'SporTV', logo: '', url: '' },
      { id: '4', name: 'GloboNews', logo: '', url: '' },
      { id: '5', name: 'CNN Brasil', logo: '', url: '' },
      { id: '6', name: 'BandNews', logo: '', url: '' },
      { id: '7', name: 'Globo', logo: '', url: '' },
      { id: '8', name: 'Record', logo: '', url: '' },
      { id: '9', name: 'SBT', logo: '', url: '' },
    ];

    if (!categoryId) return mockChannels;
    
    // Return subset based on category
    const start = (parseInt(categoryId) - 1) * 3;
    return mockChannels.slice(start, start + 3);
  }
}

export default IPTVApi;
