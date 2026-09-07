import { create } from 'axios';
import { API_URL } from '@/hangso/config';
import { tokenStorage } from '@/tienich/luutru';

export const api=create({baseURL:API_URL,timeout:15000,headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(async(config)=>{const token=await tokenStorage.get();if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
