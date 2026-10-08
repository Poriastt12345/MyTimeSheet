// src/services/authService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ذخیره اطلاعات کاربر برای refresh token
const saveUserCredentials = async (phoneNumber, password) => {
  try {
    await AsyncStorage.setItem('@user_phone', phoneNumber);
    await AsyncStorage.setItem('@user_password', password);
  } catch (error) {
    console.error('خطا در ذخیره اطلاعات:', error);
  }
};

// لاگین کاربر
export const login = async (credentials) => {
  try {
    const response = await api.post('/Auth/Login', credentials);
    
    // بررسی ساختار پاسخ
    if (response.data.status && response.data.value?.token) {
      const token = response.data.value.token;
      const userData = {
        phoneNumber: credentials.phoneNumber,
        password: credentials.password, // برای refresh token
        ...response.data.value,
      };
      
      // ذخیره توکن و اطلاعات کاربر
      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('@is_logged_in', 'true');
      
      // ذخیره اطلاعات برای refresh
      await saveUserCredentials(credentials.phoneNumber, credentials.password);
      
      return {
        success: true,
        token: token,
        data: response.data.value,
        message: response.data.statusMessage,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در ورود',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// ثبت‌نام کاربر
export const register = async (userData) => {
  try {
    const response = await api.post('/Auth/Register', userData);
    
    // بررسی ساختار پاسخ
    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'ثبت‌نام با موفقیت انجام شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در ثبت‌نام',
      };
    }
  } catch (error) {
    console.error('Register error:', error);
    
    // بررسی خطاهای مختلف
    if (error.response?.data?.statusMessage) {
      return {
        success: false,
        message: error.response.data.statusMessage,
      };
    } else if (error.response?.data?.errors) {
      // اگر خطاهای اعتبارسنجی داره
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0]?.[0] || 'خطا در اعتبارسنجی';
      return {
        success: false,
        message: firstError,
      };
    } else {
      return {
        success: false,
        message: 'خطا در ارتباط با سرور',
      };
    }
  }
};

// خروج از حساب
export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      '@auth_token',
      '@user_data',
      '@is_logged_in',
      '@user_phone',
      '@user_password',
    ]);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'خطا در خروج' };
  }
};

// بررسی وضعیت لاگین
export const isLoggedIn = async () => {
  try {
    const loggedIn = await AsyncStorage.getItem('@is_logged_in');
    return loggedIn === 'true';
  } catch (error) {
    return false;
  }
};

// دریافت اطلاعات کاربر
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem('@user_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// دریافت توکن
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@auth_token');
  } catch (error) {
    return null;
  }
};

// دریافت اطلاعات ذخیره شده برای refresh
export const getStoredCredentials = async () => {
  try {
    const phone = await AsyncStorage.getItem('@user_phone');
    const password = await AsyncStorage.getItem('@user_password');
    if (phone && password) {
      return { phoneNumber: phone, password };
    }
    return null;
  } catch (error) {
    return null;
  }
};