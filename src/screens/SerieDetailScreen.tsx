import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { IPTVApi } from '../services/IPTVApi';
import type { Serie, Season, Episode } from '../types';

interface SerieDetailScreenProps {
  serie: Serie;
  onBack: () => void;
  onPlayEpisode: (episode: Episode) => void;
}

export const SerieDetailScreen: React.FC<SerieDetailScreenProps> = ({
  serie,
  onBack,
  onPlayEpisode,
}) => {
  const { credentials } = useAuth();
  const [serieDetails, setSerieDetails] = useState<Serie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // Fetch full serie details including seasons and episodes
  useEffect(() => {
    const fetchSerieDetails = async () => {
      if (!credentials) return;

      try {
        setLoading(true);
        const api = new IPTVApi(credentials);
        
        // Get serie info with seasons
        const fullSerie = await api.getSerieInfo(serie.id);
        
        if (fullSerie && fullSerie.seasons && fullSerie.seasons.length > 0) {
          setSerieDetails(fullSerie);
          setSelectedSeason(fullSerie.seasons[0].seasonNumber);
        } else {
          setSerieDetails(serie);
        }
      } catch (error) {
        console.error('Error fetching serie details:', error);
        setSerieDetails(serie);
      } finally {
        setLoading(false);
      }
    };

    fetchSerieDetails();
  }, [serie.id, credentials, serie]);

  const currentSerie = serieDetails || serie;
  const currentSeason = currentSerie.seasons?.find(s => s.seasonNumber === selectedSeason);

  const renderSeasonButton = (season: Season) => (
    <TouchableOpacity
      key={season.id}
      style={[
        styles.seasonButton,
        selectedSeason === season.seasonNumber && styles.seasonButtonActive,
      ]}
      onPress={() => setSelectedSeason(season.seasonNumber)}
    >
      <Text
        style={[
          styles.seasonButtonText,
          selectedSeason === season.seasonNumber && styles.seasonButtonTextActive,
        ]}
      >
        T{season.seasonNumber}
      </Text>
    </TouchableOpacity>
  );

  const renderEpisode = ({ item: episode }: { item: Episode }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      onPress={() => onPlayEpisode(episode)}
    >
      <View style={styles.episodeNumber}>
        <Text style={styles.episodeNumberText}>{episode.episodeNumber}</Text>
      </View>
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeName} numberOfLines={1}>
          {episode.name || `Episódio ${episode.episodeNumber}`}
        </Text>
        {episode.duration && (
          <Text style={styles.episodeDuration}>{episode.duration}</Text>
        )}
        {episode.plot && (
          <Text style={styles.episodePlot} numberOfLines={2}>
            {episode.plot}
          </Text>
        )}
      </View>
      <View style={styles.playIcon}>
        <Text style={styles.playIconText}>▶</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← VOLTAR</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALHES DA SÉRIE</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Serie Poster and Basic Info */}
        <View style={styles.mainInfo}>
          {/* Poster */}
          <View style={styles.posterContainer}>
            {currentSerie.logo ? (
              <Image
                source={{ uri: currentSerie.logo }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Text style={styles.posterPlaceholderText}>📺</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {currentSerie.name}
            </Text>

            {currentSerie.year && (
              <Text style={styles.year}>{currentSerie.year}</Text>
            )}

            {currentSerie.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {currentSerie.rating}</Text>
              </View>
            )}

            {currentSerie.seasons && (
              <Text style={styles.seasonCount}>
                📁 {currentSerie.seasons.length} Temporada(s)
              </Text>
            )}

            {currentSerie.director && (
              <Text style={styles.director} numberOfLines={1}>
                🎬 Diretor: {currentSerie.director}
              </Text>
            )}
          </View>
        </View>

        {/* Plot */}
        {currentSerie.plot && (
          <View style={styles.plotContainer}>
            <Text style={styles.plotTitle}>SINOPSE</Text>
            <Text style={styles.plot}>{currentSerie.plot}</Text>
          </View>
        )}

        {/* Cast */}
        {currentSerie.cast && (
          <View style={styles.castContainer}>
            <Text style={styles.castTitle}>ELENCO</Text>
            <Text style={styles.cast}>{currentSerie.cast}</Text>
          </View>
        )}

        {/* Season Selector */}
        {currentSerie.seasons && currentSerie.seasons.length > 0 && (
          <View style={styles.seasonsContainer}>
            <Text style={styles.seasonsTitle}>TEMPORADAS</Text>
            <View style={styles.seasonButtons}>
              {currentSerie.seasons.map(renderSeasonButton)}
            </View>
          </View>
        )}

        {/* Episodes */}
        {currentSeason && currentSeason.episodes.length > 0 && (
          <View style={styles.episodesContainer}>
            <Text style={styles.episodesTitle}>
              EPISÓDIOS - TEMPORADA {selectedSeason}
            </Text>
            <FlatList
              data={currentSeason.episodes}
              renderItem={renderEpisode}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ff6b00" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  mainInfo: {
    flexDirection: 'row',
    padding: 24,
  },
  posterContainer: {
    width: 200,
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    fontSize: 80,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 24,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  year: {
    fontSize: 18,
    color: '#888',
    marginBottom: 8,
  },
  ratingContainer: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  rating: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seasonCount: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  director: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  playButton: {
    backgroundColor: '#ff6b00',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  plotContainer: {
    backgroundColor: '#141414',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  plotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
    marginBottom: 12,
  },
  plot: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  castContainer: {
    backgroundColor: '#141414',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  castTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
    marginBottom: 12,
  },
  cast: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  seasonsContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  seasonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
    marginBottom: 12,
  },
  seasonButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  seasonButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  seasonButtonActive: {
    backgroundColor: '#ff6b00',
    borderColor: '#ff6b00',
  },
  seasonButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seasonButtonTextActive: {
    color: '#fff',
  },
  episodesContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  episodesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b00',
    marginBottom: 12,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  episodeNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#ff6b00',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  episodeDuration: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  episodePlot: {
    color: '#666',
    fontSize: 12,
    lineHeight: 16,
  },
  playIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    color: '#fff',
    fontSize: 14,
  },
});
