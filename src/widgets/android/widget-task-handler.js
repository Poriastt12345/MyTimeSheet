// src/widgets/android/widget-task-handler.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../src/services/api'; // مسیر api.js خودتون رو اصلاح کنید
import { getTodayForAPI, formatTimeForAPI } from '../../../src/utils/dateUtils';

export async function widgetTaskHandler(props) {
  const { widgetAction, clickAction } = props;

  // اگر ویجت دوباره بارگذاری شد (مثلاً گوشی ری‌استارت شد) کاری نکن
  if (widgetAction !== 'WIDGET_CLICK') {
    return;
  }

  // دریافت اطلاعات کاربر از حافظه
  const userDataString = await AsyncStorage.getItem('@user_data');
  if (!userDataString) {
    console.error('کاربر لاگین نکرده است');
    return;
  }
  const user = JSON.parse(userDataString);
  const phoneNumber = user.phoneNumber || user.phone;

  // دریافت تاریخ و ساعت فعلی
  const persianDate = await getTodayForAPI();
  const now = new Date();
  const time = formatTimeForAPI(now);

  const payload = { phoneNumber, persianDate, time };
  let endpoint = '';

  // تشخیص دکمه‌ای که زده شده و انتخاب API مربوطه
  switch (clickAction) {
    case 'START_WORK':
      endpoint = '/TimeSheet/startWork';
      break;
    case 'END_WORK':
      endpoint = '/TimeSheet/EndWork';
      break;
    case 'START_MISSION':
      endpoint = '/TimeSheet/startMetion'; // طبق کد شما
      break;
    case 'END_MISSION':
      endpoint = '/TimeSheet/EndMetion';   // طبق کد شما
      break;
    default:
      return;
  }

  try {
    // ارسال درخواست به API دات‌نت کور
    const response = await api.post(endpoint, payload);
    if (response.data.status) {
      console.log('عملیات با موفقیت انجام شد:', response.data.statusMessage);
      // اینجا می‌تونید یک ویبره یا آپدیت UI ویجت انجام بدید
    } else {
      console.error('خطا از سمت سرور:', response.data.statusMessage);
    }
  } catch (error) {
    console.error('خطا در ارتباط با سرور:', error.message);
  }
}