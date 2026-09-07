import { Platform } from 'react-native';

// Thiết bị thật phải dùng IP LAN của máy chạy backend, ví dụ http://192.168.1.10:3000/api.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');
