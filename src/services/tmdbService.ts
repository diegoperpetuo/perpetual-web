const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface MovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie';
}

export interface TvResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'tv';
}

export interface MovieResponse extends MovieResult {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path?: string }>;
    crew: Array<{ id: number; name: string; job: string; profile_path?: string }>;
  };
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      official: boolean;
    }>;
  };
}

export interface ShowResponse extends TvResult {
  number_of_seasons: number;
  genres: Array<{ id: number; name: string }>;
  created_by: Array<{ id: number; name: string }>;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path?: string }>;
    crew: Array<{ id: number; name: string; job: string; profile_path?: string }>;
  };
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      official: boolean;
    }>;
  };
}

class TMDBService {
  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${API_BASE_URL}/api/tmdb${endpoint}`);
    
    // Adicionar parâmetros à URL
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição TMDB:', error);
      throw error;
    }
  }

  // Buscar filmes populares
  async getPopularMovies(page: number = 1): Promise<{ results: MovieResult[] }> {
    return this.makeRequest('/movies/popular', { page });
  }

  // Buscar filmes em cartaz
  async getNowPlayingMovies(page: number = 1): Promise<{ results: MovieResult[] }> {
    return this.makeRequest('/movies/now-playing', { page });
  }

  // Buscar séries populares
  async getPopularTVShows(page: number = 1): Promise<{ results: TvResult[] }> {
    return this.makeRequest('/tv/popular', { page });
  }

  // Buscar filmes em tendência
  async getTrendingMovies(timeWindow: string = 'day'): Promise<{ results: MovieResult[] }> {
    return this.makeRequest('/movies/trending', { timeWindow });
  }

  // Buscar detalhes de um filme
  async getMovieDetails(movieId: number, appendToResponse: string[] = []): Promise<MovieResponse> {
    const params: any = {};
    if (appendToResponse.length > 0) {
      params.append_to_response = appendToResponse.join(',');
    }
    return this.makeRequest(`/movie/${movieId}`, params);
  }

  // Buscar detalhes de uma série
  async getTVShowDetails(tvId: number, appendToResponse: string[] = []): Promise<ShowResponse> {
    const params: any = {};
    if (appendToResponse.length > 0) {
      params.append_to_response = appendToResponse.join(',');
    }
    return this.makeRequest(`/tv/${tvId}`, params);
  }

  // Buscar todos os gêneros
  async getAllGenres(): Promise<{ [key: number]: string }> {
    return this.makeRequest('/genres');
  }

  // Buscar múltiplos itens (filmes e séries)
  async searchMulti(query: string, page: number = 1): Promise<{ results: Array<MovieResult | TvResult> }> {
    return this.makeRequest('/search/multi', { query, page });
  }

  // Buscar filmes
  async searchMovies(query: string, page: number = 1): Promise<{ results: MovieResult[] }> {
    return this.makeRequest('/search/movie', { query, page });
  }

  // Buscar séries
  async searchTVShows(query: string, page: number = 1): Promise<{ results: TvResult[] }> {
    return this.makeRequest('/search/tv', { query, page });
  }

  // Buscar detalhes completos de um item (filme ou série)
  async getItemDetails(mediaType: 'movie' | 'tv', itemId: number, appendToResponse: string[] = ['credits', 'videos']): Promise<MovieResponse | ShowResponse> {
    return this.makeRequest(`/${mediaType}/${itemId}`, {
      append_to_response: appendToResponse.join(',')
    });
  }

  // Buscar múltiplos itens por IDs
  async getMultipleItems(items: Array<{ media_type: 'movie' | 'tv'; tmdbId: number }>): Promise<Array<MovieResponse | ShowResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/tmdb/multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Buscar gêneros de filmes (mantido para compatibilidade)
  async getMovieGenres(): Promise<{ genres: Array<{ id: number; name: string }> }> {
    const allGenres = await this.getAllGenres();
    // Converter de volta para o formato esperado
    const genres = Object.entries(allGenres).map(([id, name]) => ({
      id: parseInt(id),
      name: name as string
    }));
    return { genres };
  }

  // Buscar gêneros de séries (mantido para compatibilidade)
  async getTVGenres(): Promise<{ genres: Array<{ id: number; name: string }> }> {
    const allGenres = await this.getAllGenres();
    // Converter de volta para o formato esperado
    const genres = Object.entries(allGenres).map(([id, name]) => ({
      id: parseInt(id),
      name: name as string
    }));
    return { genres };
  }
}

export default new TMDBService(); 