import Constants from "expo-constants";

const localhost = "127.0.0.1";
const androidEmulatorHost = "10.0.2.2";

// Try to infer LAN IP for physical devices; fallback to localhost.
const hostUri = Constants.expoConfig?.hostUri ?? "";
const inferredHost = hostUri.split(":")[0] || localhost;

// If we're on inferredHost and it's 127.0.0.1, but we might be on Android emulator, 
// we should consider if we need 10.0.2.2. 
// However, inferredHost from hostUri is usually the correct machine IP.

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 
  `http://${inferredHost}:8000/api/v1`;

console.log("Connecting to API at:", API_BASE_URL);
