// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayKey } from './dateUtils';

const KEYS = {
  ALL_DAYS: '@all_days',
  USER_DATA: '@user_data',
  AUTH_TOKEN: '@auth_token',
  IS_LOGGED_IN: '@is_logged_in',
  USER_PHONE: '@user_phone',
  USER_PASSWORD: '@user_password',
};

// ============================================
// بخش زمان‌ها (TimeSheet)
// ============================================

// ذخیره یک روز
export const saveDayData = async (dayKey, data) => {
  try {
    const allDays = await getAllDays();
    
    const existingIndex = allDays.findIndex(d => d.key === dayKey);
    if (existingIndex >= 0) {
      allDays[existingIndex] = { ...allDays[existingIndex], ...data, key: dayKey };
    } else {
      allDays.push({ key: dayKey, ...data });
    }
    
    await AsyncStorage.setItem(KEYS.ALL_DAYS, JSON.stringify(allDays));
    return true;
  } catch (error) {
    console.error('خطا در ذخیره:', error);
    return false;
  }
};

// دریافت همه روزها
export const getAllDays = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ALL_DAYS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('خطا در دریافت:', error);
    return [];
  }
};

// دریافت یک روز خاص
export const getDayData = async (dayKey) => {
  try {
    const allDays = await getAllDays();
    return allDays.find(d => d.key === dayKey) || null;
  } catch (error) {
    console.error('خطا در دریافت روز:', error);
    return null;
  }
};

// حذف یک روز
export const deleteDayData = async (dayKey) => {
  try {
    const allDays = await getAllDays();
    const filtered = allDays.filter(d => d.key !== dayKey);
    await AsyncStorage.setItem(KEYS.ALL_DAYS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('خطا در حذف:', error);
    return false;
  }
};

// ذخیره روز جاری
export const saveTodayData = async (dayKey, data) => {
  if (!dayKey) {
    const todayKey = await getTodayKey();
    dayKey = todayKey;
  }
  return await saveDayData(dayKey, data);
};

// دریافت روز جاری
export const getTodayData = async (dayKey) => {
  if (!dayKey) {
    const todayKey = await getTodayKey();
    dayKey = todayKey;
  }
  return await getDayData(dayKey);
};

// پاک کردن همه داده‌ها
export const clearAllDays = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.ALL_DAYS);
    return true;
  } catch (error) {
    console.error('خطا در پاک کردن:', error);
    return false;
  }
};

// ============================================
// بخش احراز هویت (Auth)
// ============================================

// ذخیره توکن
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    return true;
  } catch (error) {
    console.error('خطا در ذخیره توکن:', error);
    return false;
  }
};

// دریافت توکن
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('خطا در دریافت توکن:', error);
    return null;
  }
};

// ذخیره اطلاعات کاربر
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
    await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, 'true');
    return true;
  } catch (error) {
    console.error('خطا در ذخیره اطلاعات کاربر:', error);
    return false;
  }
};

// دریافت اطلاعات کاربر
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error);
    return null;
  }
};

// بررسی وضعیت لاگین
export const isLoggedIn = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.IS_LOGGED_IN);
    return value === 'true';
  } catch (error) {
    console.error('خطا در بررسی وضعیت لاگین:', error);
    return false;
  }
};

// ذخیره اطلاعات برای refresh token
export const saveUserCredentials = async (phone, password) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PHONE, phone);
    await AsyncStorage.setItem(KEYS.USER_PASSWORD, password);
    return true;
  } catch (error) {
    console.error('خطا در ذخیره اطلاعات:', error);
    return false;
  }
};

// دریافت اطلاعات برای refresh token
export const getUserCredentials = async () => {
  try {
    const phone = await AsyncStorage.getItem(KEYS.USER_PHONE);
    const password = await AsyncStorage.getItem(KEYS.USER_PASSWORD);
    if (phone && password) {
      return { phoneNumber: phone, password };
    }
    return null;
  } catch (error) {
    console.error('خطا در دریافت اطلاعات:', error);
    return null;
  }
};

// خروج از حساب
export const logoutUser = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.AUTH_TOKEN,
      KEYS.USER_DATA,
      KEYS.IS_LOGGED_IN,
      KEYS.USER_PHONE,
      KEYS.USER_PASSWORD,
    ]);
    return true;
  } catch (error) {
    console.error('خطا در خروج:', error);
    return false;
  }
};

// ============================================
// بخش عمومی
// ============================================

// پاک کردن همه داده‌ها (برای تست)
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('خطا در پاک کردن:', error);
    return false;
  }
};