import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY='personal_finance_token';
let sessionToken:string|null=null;

export const tokenStorage={
  get:async()=>sessionToken ?? (Platform.OS==='web' ? localStorage.getItem(TOKEN_KEY) : SecureStore.getItemAsync(TOKEN_KEY)),
  set:async(value:string,persist=true)=>{
    sessionToken=value;
    if(persist){
      if(Platform.OS==='web')localStorage.setItem(TOKEN_KEY,value);
      else await SecureStore.setItemAsync(TOKEN_KEY,value);
    }else{
      if(Platform.OS==='web')localStorage.removeItem(TOKEN_KEY);
      else await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },
  remove:async()=>{
    sessionToken=null;
    if(Platform.OS==='web')localStorage.removeItem(TOKEN_KEY);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
