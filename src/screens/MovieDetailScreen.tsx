import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { IPTVApi } from '../services/IPTVApi';
import type { Movie } from '../types';

interface MovieDetailScreenProps {
  movie: Movie;
  onBack: () => void;
  onPlay: (movie: Movie) => void;
}

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({
  movie,
  onBack,
  onPlay,
}) => {
  const { credentials } = useAuth();
  const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!credentials) return;

      try {
        setLoading(true);
        const api = new IPTVApi(credentials);
        
        // Get all VOD streams to find the specific movie
        const allMovies = await api.getVodStreams();
        const foundMovie = allMovies.find(m => m.id === movie.id);
        
        if (foundMovie) {
          setMovieDetails(foundMovie);
        } else {
          setMovieDetails(movie);
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setMovieDetails(movie);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movie.id, credentials, movie]);

  const currentMovie = movieDetails || movie;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← VOLTAR</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALHES DO FILME</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Movie Poster and Basic Info */}
        <View style={styles.mainInfo}>
          {/* Poster */}
          <View style={styles.posterContainer}>
            {currentMovie.logo ? (
              <Image
                source={{ uri: currentMovie.logo }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Text style={styles.posterPlaceholderText}>🎬</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {currentMovie.name}
            </Text>

            {currentMovie.year && (
              <Text style={styles.year}>{currentMovie.year}</Text>
            )}

            {currentMovie.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {currentMovie.rating}</Text>
              </View>
            )}

            {currentMovie.duration && (
              <Text style={styles.duration}>⏱️ {currentMovie.duration}</Text>
            )}

            {currentMovie.director && (
              <Text style={styles.director} numberOfLines={1}>
                🎬 Diretor: {currentMovie.director}
              </Text>
            )}
          </View>
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => onPlay(currentMovie)}
        >
          <Text style={styles.playButtonText}>▶ ASSISTIR AGORA</Text>
        </TouchableOpacity>

        {/* Plot */}
        {currentMovie.plot && (
          <View style={styles.plotContainer}>
            <Text style={styles.plotTitle}>SINOPSE</Text>
            <Text style={styles.plot}>{currentMovie.plot}</Text>
          </View>
        )}

        {/* Cast */}
        {currentMovie.cast && (
          <View style={styles.castContainer}>
            <Text style={styles.castTitle}>ELENCO</Text>
            <Text style={styles.cast}>{currentMovie.cast}</Text>
          </View>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff6b00" />
        </View>
      )}
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
    padding: 24,
  },
  mainInfo: {
    flexDirection: 'row',
    marginBottom: 24,
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
  duration: {
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
    paddingVertical: 16,
    paddingHorizontal: 32,
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
    padding: 20,
    borderRadius: 8,
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
});
