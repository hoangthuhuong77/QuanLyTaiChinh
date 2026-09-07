import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const TOKEN_KEY='personal_finance_token';
export const tokenStorage={
  get:()=>Platform.OS==='web'?Promise.resolve(localStorage.getItem(TOKEN_KEY)):SecureStore.getItemAsync(TOKEN_KEY),
  set:(value:string)=>Platform.OS==='web'?Promise.resolve(localStorage.setItem(TOKEN_KEY,value)):SecureStore.setItemAsync(TOKEN_KEY,value),
  remove:()=>Platform.OS==='web'?Promise.resolve(localStorage.removeItem(TOKEN_KEY)):SecureStore.deleteItemAsync(TOKEN_KEY),
};
