import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import type { Channel } from '../types';
import { VideoPlayer } from '../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlayerScreenProps {
  channel: Channel;
  onClose: () => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  channel,
  onClose,
  onNextChannel,
  onPrevChannel,
}) => {
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Esconde controles após 3 segundos
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Lidar com botão voltar do Android/Fire Stick (apenas mobile)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [onClose]);

  const togglePlayPause = useCallback(() => {
    setPlaying(prev => !prev);
    setShowControls(true);
  }, []);

  const handleScreenPress = useCallback(() => {
    setShowControls(true);
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && <StatusBar hidden />}

      {/* Video Player */}
      <TouchableOpacity 
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={handleScreenPress}
      >
        {channel.url ? (
          <VideoPlayer
            url={channel.url}
            onLoad={() => {
              setLoading(false);
              setError(null);
            }}
            onError={(err) => {
              setLoading(false);
              setError('Erro ao carregar stream');
              console.error('Player error:', err);
            }}
          />
        ) : (
          <View style={[styles.video, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#666', fontSize: 18 }}>Sem URL do canal</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Text style={styles.backButtonText}>← VOLTAR</Text>
              </TouchableOpacity>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelTime}>Canal Ao Vivo</Text>
              </View>
              <View style={styles.placeholder} />
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity style={styles.controlButton} onPress={onPrevChannel}>
                <Text style={styles.controlButtonText}>◀◀</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.playButton]} 
                onPress={togglePlayPause}
              >
                <Text style={styles.playButtonText}>
                  {playing ? '❚❚' : '▶'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={onNextChannel}>
                <Text style={styles.controlButtonText}>▶▶</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              <Text style={styles.infoText}>Use o controle remoto para navegar</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  channelInfo: {
    alignItems: 'center',
    flex: 1,
  },
  channelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  channelTime: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  placeholder: {
    width: 80,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    backgroundColor: '#ff6b00',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 28,
  },
  bottomBar: {
    alignItems: 'center',
  },
  infoText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
