import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Universal storage utility that uses SecureStore on native platforms
 * and fallbacks to AsyncStorage (localStorage) on Web.
 */

const isWeb = Platform.OS === 'web';

export const setItem = async (key, value) => {
  try {
    if (isWeb) {
      await AsyncStorage.setItem(key, value);
    } else {
      // expo-secure-store requires value to be a string
      await SecureStore.setItemAsync(key, String(value));
    }
    return true;
  } catch (error) {
    console.error(`[Storage] Error setting item ${key}:`, error);
    return false;
  }
};

export const getItem = async (key) => {
  try {
    if (isWeb) {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`[Storage] Error getting item ${key}:`, error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    if (isWeb) {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
    return true;
  } catch (error) {
    console.error(`[Storage] Error removing item ${key}:`, error);
    return false;
  }
};

export default {
  setItem,
  getItem,
  removeItem,
};
