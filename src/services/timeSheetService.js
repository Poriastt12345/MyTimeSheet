// src/services/timeSheetService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// دریافت شماره همراه کاربر
const getPhoneNumber = async () => {
  try {
    const userData = await AsyncStorage.getItem('@user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.phoneNumber || user.phone;
    }
    return null;
  } catch (error) {
    console.error('خطا در دریافت شماره کاربر:', error);
    return null;
  }
};

// شروع کار
export const startWork = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.post('/TimeSheet/startWork', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'شروع کار ثبت شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در ثبت شروع کار',
      };
    }
  } catch (error) {
    console.error('Start Work Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// شروع ماموریت - ✅ اصلاح شده با مسیر درست
export const startMission = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    // ✅ مسیر درست: startMetion (با e)
    const response = await api.post('/TimeSheet/startMetion', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'شروع ماموریت ثبت شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در ثبت شروع ماموریت',
      };
    }
  } catch (error) {
    console.error('Start Mission Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// پایان ماموریت - ✅ اصلاح شده با مسیر درست
export const endMission = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    // ✅ مسیر درست: EndMetion (با e)
    const response = await api.post('/TimeSheet/EndMetion', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'پایان ماموریت ثبت شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در ثبت پایان ماموریت',
      };
    }
  } catch (error) {
    console.error('End Mission Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// پایان کار
export const endWork = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.post('/TimeSheet/EndWork', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'پایان کار ثبت شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در ثبت پایان کار',
      };
    }
  } catch (error) {
    console.error('End Work Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// دریافت وضعیت امروز
export const getTodayStatus = async (persianDate) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.get('/TimeSheet/GetStatus', {
      params: {
        persianDate,
        phoneNumber,
      },
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در دریافت وضعیت',
      };
    }
  } catch (error) {
    console.error('Get Status Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// دریافت آمار امروز
export const getTodayStats = async (persianDate) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.get('/TimeSheet/GetStats', {
      params: {
        persianDate,
        phoneNumber,
      },
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در دریافت آمار',
      };
    }
  } catch (error) {
    console.error('Get Stats Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// دریافت تاریخچه
export const getHistory = async (year, month) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.get('/TimeSheet/GetHistory', {
      params: {
        year,
        month,
        phoneNumber,
      },
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage,
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در دریافت تاریخچه',
      };
    }
  } catch (error) {
    console.error('Get History Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

export const stopTime = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.post('/TimeSheet/StopingTime', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'ساعت کار متوقف شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در توقف کار',
      };
    }
  } catch (error) {
    console.error('Stop Time Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// 2. شروع مجدد زمان کار (StartStopTime)
export const startStopTime = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.post('/TimeSheet/StartStopTime', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'ساعت کار از سر گرفته شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در شروع مجدد کار',
      };
    }
  } catch (error) {
    console.error('Start Stop Time Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};

// 3. کسر زمان دلخواه (AddStopTime)
export const addStopTime = async (persianDate, time) => {
  try {
    const phoneNumber = await getPhoneNumber();
    if (!phoneNumber) {
      return { success: false, message: 'شماره کاربر یافت نشد' };
    }

    const response = await api.post('/TimeSheet/AddStopTime', {
      persianDate,
      time,
      phoneNumber,
    });

    if (response.data.status) {
      return {
        success: true,
        data: response.data.value,
        message: response.data.statusMessage || 'تایم مورد نظر کسر شد',
      };
    } else {
      return {
        success: false,
        message: response.data.statusMessage || 'خطا در کسر زمان',
      };
    }
  } catch (error) {
    console.error('Add Stop Time Error:', error);
    return {
      success: false,
      message: error.response?.data?.statusMessage || 'خطا در ارتباط با سرور',
    };
  }
};