import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  type?: 'live' | 'vod';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  onLoad, 
  onError,
  type = 'live'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setError('Player apenas para web');
      setLoading(false);
      return;
    }

    if (!videoRef.current || !url) {
      setError('URL não fornecida');
      setLoading(false);
      return;
    }

    // Determine source type
    const isHLS = url.includes('.m3u8') || url.includes('mpegts') || type === 'live';
    const isMP4 = url.includes('.mp4') || url.includes('.mkv') || url.includes('.avi');
    
    const src: any = {
      src: url,
      type: isHLS ? 'application/x-mpegURL' : isMP4 ? 'video/mp4' : 'video/mp4'
    };

    // Initialize Video.js player
    const options = {
      autoplay: true,
      controls: true,
      fluid: true,
      responsive: true,
      html5: {
        vhs: {
          overrideNative: true,
          limitRenditionByPlayerDimensions: true,
          useDevicePixelRatio: true,
          handlePartialData: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      sources: [src],
    };

    try {
      playerRef.current = videojs(videoRef.current, options, function() {
        console.log('Video.js player ready');
        setLoading(false);
        onLoad?.();
      });

      // Error handling
      playerRef.current.on('error', () => {
        const errorData = playerRef.current.error();
        console.error('Video.js error:', errorData);
        
        let errorMessage = 'Erro ao carregar vídeo';
        if (errorData) {
          switch (errorData.code) {
            case 1:
              errorMessage = 'Vídeo abortado';
              break;
            case 2:
              errorMessage = 'Erro de rede - Verifique sua conexão';
              break;
            case 3:
              errorMessage = 'Erro de decodificação - Formato não suportado';
              break;
            case 4:
              errorMessage = 'Vídeo não suportado neste navegador';
              break;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
        onError?.(errorData);
      });

      // Loading events
      playerRef.current.on('waiting', () => setLoading(true));
      playerRef.current.on('playing', () => setLoading(false));
      playerRef.current.on('canplay', () => setLoading(false));

    } catch (err) {
      console.error('Error initializing Video.js:', err);
      setError('Erro ao inicializar player');
      setLoading(false);
      onError?.(err);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Player apenas para web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div data-vjs-player style={{ width: '100%', height: '100%' }}>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ff6b00" />
          <Text style={styles.loadingText}>Carregando stream...</Text>
        </View>
      )}
      
      {error && (
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.hintText}>
            {type === 'live' 
              ? 'Streams IPTV podem ter restrições de CORS no navegador.\nTeste no app Android/Fire Stick para melhor compatibilidade.'
              : 'Verifique sua conexão e tente novamente.'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  hintText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
});
