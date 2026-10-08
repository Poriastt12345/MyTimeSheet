// src/utils/dateUtils.js
import { getTodayDate } from '../services/dateService';

// دریافت تاریخ امروز از API
export const getTodayPersianDate = async () => {
  const result = await getTodayDate();
  if (result.success) {
    return {
      key: result.data.persianDate.replace(/\//g, '-'), // 1405-05-29
      full: result.data.persianDate, // 1405/05/29
      weekDay: result.data.wd,
      isHolyDay: result.data.isHolyDay,
    };
  }
  return null;
};

// دریافت کلید امروز (برای ذخیره‌سازی محلی)
export const getTodayKey = async () => {
  const result = await getTodayDate();
  if (result.success) {
    return result.data.persianDate.replace(/\//g, '-');
  }
  return null;
};

// دریافت تاریخ امروز برای API (فرمت 1405/05/29)
export const getTodayForAPI = async () => {
  const result = await getTodayDate();
  if (result.success) {
    return result.data.persianDate; // 1405/05/29
  }
  return null;
};

// فرمت زمان برای نمایش در UI
export const formatTime = (date) => {
  if (!date) return '--:--';
  
  // اگر تاریخ به صورت string از سرور اومده، مستقیم استفاده کن
  try {
    const d = new Date(date);
    // چک کن که تاریخ معتبر باشه
    if (isNaN(d.getTime())) {
      // اگر تاریخ معتبر نبود، خود string رو برگردون
      return date;
    }
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    return date; // برگردوندن خود string
  }
};

// فرمت زمان برای ارسال به API (HH:mm)
export const formatTimeForAPI = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// دریافت ماه‌های شمسی (برای نمایش)
export const getPersianMonths = () => {
  return [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
};