// src/services/dateService.js
import api from './api';

export const getTodayDate = async () => {
  try {
    const response = await api.get('/PersianDate/GetDateNow');
    
    if (response.data.status && response.data.value) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در دریافت تاریخ',
      };
    }
  } catch (error) {
    console.error('Get Date Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// تبدیل تاریخ میلادی به شمسی (با API)
export const convertToPersianDate = async (gregorianDate) => {
  try {
    const response = await api.post('/PersianDate/Convert', {
      date: gregorianDate,
    });
    
    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage,
      };
    }
  } catch (error) {
    console.error('Convert Date Error:', error);
    return {
      success: false,
      message: 'خطا در تبدیل تاریخ',
    };
  }
};

// دریافت لیست ماه‌های شمسی
export const getPersianMonths = () => {
  return [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
};

// دریافت روزهای هفته شمسی
export const getPersianWeekDays = () => {
  return ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
};

// فرمت کردن تاریخ برای نمایش
export const formatPersianDate = (dateStr) => {
  if (!dateStr) return '--/--/----';
  // dateStr به فرمت 1405/05/29
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1]}/${parts[2]}`;
  }
  return dateStr;
};

// تبدیل تاریخ شمسی به میلادی (برای ارسال به سرور)
export const persianToGregorian = async (persianDate) => {
  try {
    const response = await api.post('/PersianDate/ToGregorian', {
      persianDate: persianDate,
    });
    
    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage,
      };
    }
  } catch (error) {
    console.error('Convert to Gregorian Error:', error);
    return {
      success: false,
      message: 'خطا در تبدیل تاریخ',
    };
  }
};