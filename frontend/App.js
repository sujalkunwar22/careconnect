import "./global.css";

import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';

import {
  MaterialSymbolsOutlined_400Regular,
} from '@expo-google-fonts/material-symbols-outlined';

import * as SplashScreen from 'expo-splash-screen';

import queryClient from './src/lib/queryClient';
import useAuthStore from './src/stores/authStore';
import NavigationRoot from './src/navigation/NavigationRoot';
import GlobalErrorBoundary from './src/components/common/GlobalErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    'Material Symbols Outlined': MaterialSymbolsOutlined_400Regular,
  });

  useEffect(() => {
    initialize();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    console.log('[App] Loading fonts or auth...', { fontsLoaded, isLoading });
    return null;
  }

  console.log('[App] Rendering providers, auth state:', { isLoading });

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <GlobalErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <NavigationRoot />
            <StatusBar style="dark" />
            <Toast />
          </QueryClientProvider>
        </GlobalErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
