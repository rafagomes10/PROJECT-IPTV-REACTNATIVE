import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { IPTVApi } from '../services/IPTVApi';
import type { Category, Channel, Movie, Serie } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ContentType = 'live' | 'movies' | 'series';

interface HomeScreenProps {
  onChannelSelect: (channel: Channel) => void;
  onMovieSelect?: (movie: Movie) => void;
  onSerieSelect?: (serie: Serie) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onChannelSelect,
  onMovieSelect,
  onSerieSelect,
}) => {
  const { credentials, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ContentType>('live');
  
  // Live TV states
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  const [selectedLiveCategory, setSelectedLiveCategory] = useState<string | null>(null);
  const [liveChannels, setLiveChannels] = useState<Channel[]>([]);
  
  // Movies states
  const [movieCategories, setMovieCategories] = useState<Category[]>([]);
  const [selectedMovieCategory, setSelectedMovieCategory] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  
  // Series states
  const [seriesCategories, setSeriesCategories] = useState<Category[]>([]);
  const [selectedSeriesCategory, setSelectedSeriesCategory] = useState<string | null>(null);
  const [series, setSeries] = useState<Serie[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  // Load all content on mount
  useEffect(() => {
    loadAllContent();
  }, []);

  // Load channels when live category changes
  useEffect(() => {
    if (activeTab === 'live' && selectedLiveCategory) {
      loadLiveChannels(selectedLiveCategory);
    }
  }, [activeTab, selectedLiveCategory]);

  // Load movies when movie category changes
  useEffect(() => {
    if (activeTab === 'movies' && selectedMovieCategory) {
      loadMovies(selectedMovieCategory);
    }
  }, [activeTab, selectedMovieCategory]);

  // Load series when series category changes
  useEffect(() => {
    if (activeTab === 'series' && selectedSeriesCategory) {
      loadSeries(selectedSeriesCategory);
    }
  }, [activeTab, selectedSeriesCategory]);

  const loadAllContent = async () => {
    if (!credentials) return;

    try {
      setLoading(true);
      setError(null);

      const api = new IPTVApi(credentials);

      // Load categories for all content types
      const [liveCats, movieCats, seriesCats] = await Promise.all([
        api.getLiveCategories().catch(() => []),
        api.getVodCategories().catch(() => []),
        api.getSeriesCategories().catch(() => []),
      ]);

      setLiveCategories(liveCats);
      setMovieCategories(movieCats);
      setSeriesCategories(seriesCats);

      // Set initial selections
      if (liveCats.length > 0) {
        setSelectedLiveCategory(liveCats[0].id);
      }
      if (movieCats.length > 0) {
        setSelectedMovieCategory(movieCats[0].id);
      }
      if (seriesCats.length > 0) {
        setSelectedSeriesCategory(seriesCats[0].id);
      }

    } catch (err) {
      console.error('Error loading content:', err);
      setError('Erro ao carregar conteúdo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadLiveChannels = async (categoryId: string) => {
    if (!credentials) return;
    
    try {
      const api = new IPTVApi(credentials);
      const channels = await api.getLiveStreams(categoryId);
      setLiveChannels(channels);
    } catch (err) {
      console.error('Error loading channels:', err);
    }
  };

  const loadMovies = async (categoryId: string) => {
    if (!credentials) return;
    
    try {
      const api = new IPTVApi(credentials);
      const moviesList = await api.getVodStreams(categoryId);
      setMovies(moviesList);
    } catch (err) {
      console.error('Error loading movies:', err);
    }
  };

  const loadSeries = async (categoryId: string) => {
    if (!credentials) return;
    
    try {
      const api = new IPTVApi(credentials);
      const seriesList = await api.getSeries(categoryId);
      setSeries(seriesList);
    } catch (err) {
      console.error('Error loading series:', err);
    }
  };

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout, style: 'destructive' },
      ]
    );
  }, [logout]);

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'live' && styles.tabActive]}
        onPress={() => setActiveTab('live')}
      >
        <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]}>
          📺 CANAIS
        </Text>
        {liveCategories.length > 0 && (
          <Text style={[styles.tabCount, activeTab === 'live' && styles.tabCountActive]}>
            {liveCategories.length}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'movies' && styles.tabActive]}
        onPress={() => setActiveTab('movies')}
      >
        <Text style={[styles.tabText, activeTab === 'movies' && styles.tabTextActive]}>
          🎬 FILMES
        </Text>
        {movieCategories.length > 0 && (
          <Text style={[styles.tabCount, activeTab === 'movies' && styles.tabCountActive]}>
            {movieCategories.length}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'series' && styles.tabActive]}
        onPress={() => setActiveTab('series')}
      >
        <Text style={[styles.tabText, activeTab === 'series' && styles.tabTextActive]}>
          📁 SÉRIES
        </Text>
        {seriesCategories.length > 0 && (
          <Text style={[styles.tabCount, activeTab === 'series' && styles.tabCountActive]}>
            {seriesCategories.length}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render category sidebar
  const renderCategorySidebar = (categories: Category[], selectedId: string | null, onSelect: (id: string) => void) => (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>CATEGORIAS ({categories.length})</Text>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedId === item.id && styles.categoryItemActive,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedId === item.id && styles.categoryTextActive,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  // Render live channels grid
  const renderLiveContent = () => (
    <View style={styles.contentArea}>
      {renderCategorySidebar(liveCategories, selectedLiveCategory, setSelectedLiveCategory)}
      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>
          Canais Ao Vivo ({liveChannels.length})
        </Text>
        <FlatList
          data={liveChannels}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.channelItem}
              onPress={() => onChannelSelect(item)}
            >
              <View style={styles.channelLogo}>
                <Text style={styles.channelLogoText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.channelName} numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          numColumns={4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.channelList}
        />
      </View>
    </View>
  );

  // Render movies grid
  const renderMoviesContent = () => (
    <View style={styles.contentArea}>
      {renderCategorySidebar(movieCategories, selectedMovieCategory, setSelectedMovieCategory)}
      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>
          Filmes ({movies.length})
        </Text>
        <FlatList
          data={movies}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.movieItem}
              onPress={() => onMovieSelect?.(item)}
            >
              <View style={styles.moviePoster}>
                <Text style={styles.moviePosterText}>🎬</Text>
              </View>
              <Text style={styles.movieTitle} numberOfLines={2}>
                {item.name}
              </Text>
              {item.year && (
                <Text style={styles.movieYear}>{item.year}</Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          numColumns={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.movieList}
        />
      </View>
    </View>
  );

  // Render series grid
  const renderSeriesContent = () => (
    <View style={styles.contentArea}>
      {renderCategorySidebar(seriesCategories, selectedSeriesCategory, setSelectedSeriesCategory)}
      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>
          Séries ({series.length})
        </Text>
        <FlatList
          data={series}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.serieItem}
              onPress={() => onSerieSelect?.(item)}
            >
              <View style={styles.seriePoster}>
                <Text style={styles.seriePosterText}>📺</Text>
              </View>
              <Text style={styles.serieTitle} numberOfLines={2}>
                {item.name}
              </Text>
              {item.year && (
                <Text style={styles.serieYear}>{item.year}</Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          numColumns={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.serieList}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b00" />
        <Text style={styles.loadingText}>Carregando conteúdo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: '#ff6b00', marginBottom: 20 }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAllContent}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fire IPTV</Text>
          <Text style={styles.headerSubtitle}>
            {credentials?.username}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {activeTab === 'live' && renderLiveContent()}
      {activeTab === 'movies' && renderMoviesContent()}
      {activeTab === 'series' && renderSeriesContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    backgroundColor: '#ff6b00',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b00',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  tabCountActive: {
    backgroundColor: '#fff',
    color: '#ff6b00',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    backgroundColor: '#141414',
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
    paddingTop: 20,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 1,
  },
  categoryList: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryItemActive: {
    backgroundColor: '#ff6b00',
  },
  categoryText: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  channelList: {
    paddingBottom: 20,
  },
  channelItem: {
    width: (SCREEN_WIDTH - 220 - 72) / 4 - 12,
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  channelLogo: {
    width: 60,
    height: 60,
    backgroundColor: '#ff6b00',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  channelName: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    fontWeight: '500',
  },
  movieList: {
    paddingBottom: 20,
  },
  movieItem: {
    width: (SCREEN_WIDTH - 220 - 72) / 5 - 12,
    margin: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  moviePoster: {
    width: '100%',
    aspectRatio: 2/3,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moviePosterText: {
    fontSize: 40,
  },
  movieTitle: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
    padding: 8,
    paddingBottom: 4,
  },
  movieYear: {
    fontSize: 10,
    color: '#888',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  serieList: {
    paddingBottom: 20,
  },
  serieItem: {
    width: (SCREEN_WIDTH - 220 - 72) / 5 - 12,
    margin: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  seriePoster: {
    width: '100%',
    aspectRatio: 2/3,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seriePosterText: {
    fontSize: 40,
  },
  serieTitle: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
    padding: 8,
    paddingBottom: 4,
  },
  serieYear: {
    fontSize: 10,
    color: '#888',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
