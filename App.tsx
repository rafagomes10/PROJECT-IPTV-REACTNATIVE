/**
 * Fire IPTV - App para Smart TV (Fire Stick)
 * https://github.com/seu-usuario/fire-iptv
 */

import React, { useState, useCallback } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen, HomeScreen, PlayerScreen } from './src/screens';
import type { Channel } from './src/types';

// Componente principal do App
function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated } = useAuth();
  
  // Estado para navegação entre telas
  const [currentScreen, setCurrentScreen] = useState<'home' | 'player'>('home');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  // Callback para selecionar um canal
  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setCurrentScreen('player');
  }, []);

  // Callback para fechar o player
  const handleClosePlayer = useCallback(() => {
    setCurrentScreen('home');
    setSelectedChannel(null);
  }, []);

  // Callbacks para navegação entre canais
  const handleNextChannel = useCallback(() => {
    // Implementar lógica para próximo canal
    console.log('Próximo canal');
  }, []);

  const handlePrevChannel = useCallback(() => {
    // Implementar lógica para canal anterior
    console.log('Canal anterior');
  }, []);

  // Renderiza a tela atual
  const renderScreen = () => {
    if (!isAuthenticated) {
      return <LoginScreen />;
    }

    if (currentScreen === 'player' && selectedChannel) {
      return (
        <PlayerScreen
          channel={selectedChannel}
          onClose={handleClosePlayer}
          onNextChannel={handleNextChannel}
          onPrevChannel={handlePrevChannel}
        />
      );
    }

    return <HomeScreen onChannelSelect={handleChannelSelect} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
    </View>
  );
}

// Componente raiz do App
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
