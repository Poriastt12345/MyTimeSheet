// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    return 'http://10.216.97.111:5064/api/'; 
  }
  
  return 'https://your-api-domain.com/api/';
};

const BASE_URL = getBaseUrl();

console.log('📍 API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // اگر خطا 401 یا 403 بود و یکبار تلاش برای refresh نشده
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // دریافت اطلاعات ذخیره شده کاربر
        const phone = await AsyncStorage.getItem('@user_phone');
        const password = await AsyncStorage.getItem('@user_password');
        
        if (phone && password) {
          // درخواست توکن جدید با لاگین مجدد
          const response = await api.post('/Auth/Login', {
            phoneNumber: phone,
            password: password,
          });
          
          if (response.data.status && response.data.value?.token) {
            const newToken = response.data.value.token;
            
            // ذخیره توکن جدید
            await AsyncStorage.setItem('@auth_token', newToken);
            
            // به‌روزرسانی هدر درخواست اصلی
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // ارسال مجدد درخواست اصلی
            return api(originalRequest);
          }
        }
        
        // اگر refresh ناموفق بود، کاربر رو خارج کن
        await AsyncStorage.multiRemove([
          '@auth_token',
          '@user_data',
          '@is_logged_in',
          '@user_phone',
          '@user_password',
        ]);
        
        return Promise.reject(error);
        
      } catch (refreshError) {
        console.error('Refresh Token Error:', refreshError);
        // پاک کردن داده‌ها در صورت خطا
        await AsyncStorage.multiRemove([
          '@auth_token',
          '@user_data',
          '@is_logged_in',
          '@user_phone',
          '@user_password',
        ]);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;