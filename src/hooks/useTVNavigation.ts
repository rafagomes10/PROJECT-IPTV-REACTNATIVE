import { useEffect, useCallback, useRef } from 'react';
import { Platform, Keyboard } from 'react-native';

export type Direction = 'up' | 'down' | 'left' | 'right' | 'select' | 'back';

interface UseTVNavigationOptions {
  onDirection?: (direction: Direction) => void;
  onSelect?: () => void;
  onBack?: () => void;
}

// Mapeamento de keyCodes para Fire Stick / Android TV
const KEY_CODES: Record<number, Direction> = {
  19: 'up',      // DPAD_UP
  20: 'down',    // DPAD_DOWN
  21: 'left',    // DPAD_LEFT
  22: 'right',   // DPAD_RIGHT
  23: 'select',  // DPAD_CENTER/OK
  66: 'select',  // ENTER
  4: 'back',     // BACK
  27: 'back',    // ESCAPE
};

export const useTVNavigation = (options: UseTVNavigationOptions) => {
  const { onDirection, onSelect, onBack } = options;
  
  // Usamos refs para acessar os callbacks mais recentes
  const callbacksRef = useRef({ onDirection, onSelect, onBack });
  callbacksRef.current = { onDirection, onSelect, onBack };

  const handleKeyPress = useCallback((event: { keyCode: number }) => {
    const direction = KEY_CODES[event.keyCode];
    
    if (!direction) return;

    switch (direction) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        callbacksRef.current.onDirection?.(direction);
        break;
      case 'select':
        callbacksRef.current.onSelect?.();
        break;
      case 'back':
        callbacksRef.current.onBack?.();
        break;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // @ts-ignore - API interna do React Native para teclas
    const subscription = Keyboard.addListener('onKeyPress', handleKeyPress);

    return () => {
      subscription?.remove?.();
    };
  }, [handleKeyPress]);
};
