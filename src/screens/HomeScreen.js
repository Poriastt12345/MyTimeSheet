// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
   TextInput,
  Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { TimeButton } from '../components/TimeButton';
import { PersianDate } from '../components/PersianDate';
import { colors, globalStyles } from '../styles/globalStyles';
import { 
  startWork, 
  startMission, 
  endMission, 
  endWork,
  getTodayStatus,
  getTodayStats,
   stopTime,        // ✅ اضافه شد
  startStopTime,   // ✅ اضافه شد
  addStopTime, 
} from '../services/timeSheetService';
import { 
  formatTime, 
  formatTimeForAPI,
  getTodayForAPI,
  getTodayPersianDate,
} from '../utils/dateUtils';
import { logout } from '../services/authService';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [todayData, setTodayData] = useState({
    startWork: null,
    startMission: null,
    endMission: null,
    endWork: null,
    weekDay: '',
    persianDate: '',
  });
  const [stats, setStats] = useState({
    totalHours: 0,
    normalHours: 0,
    missionHours: 0,
    overtime: 0,
    normalWorkHours: 9,
    weekDay: '',
  });
 const [modalVisible, setModalVisible] = useState(false);
  const [manualTime, setManualTime] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const persianDate = await getTodayForAPI();
      const persianDateObj = await getTodayPersianDate();
      
      if (!persianDate) {
        Alert.alert('خطا', 'مشکل در دریافت تاریخ');
        setLoading(false);
        return;
      }

      const statusResult = await getTodayStatus(persianDate);
      
      if (statusResult.success && statusResult.data) {
        const serverData = statusResult.data;
        
        const mergedData = {
          startWork: serverData.startWork ? serverData.startWork : null,
          endWork: serverData.endWork ? serverData.endWork : null,
          startMission: serverData.startMission ? serverData.startMission : null,
          endMission: serverData.endMission ? serverData.endMission : null,
          weekDay: persianDateObj?.weekDay || '',
          persianDate: persianDate,
        };
        
        setTodayData(mergedData);
      } else {
        setTodayData({
          ...todayData,
          weekDay: persianDateObj?.weekDay || '',
          persianDate: persianDate,
        });
      }

      const statsResult = await getTodayStats(persianDate);
      if (statsResult.success && statsResult.data) {
        setStats({
          totalHours: statsResult.data.totalHours || 0,
          normalHours: statsResult.data.normalHours || 0,
          missionHours: statsResult.data.missionHours || 0,
          overtime: statsResult.data.overtime || 0,
          normalWorkHours: statsResult.data.normalWorkHours || 9,
          weekDay: persianDateObj?.weekDay || '',
        });
      }

    } catch (error) {
      console.error('خطا در بارگذاری:', error);
      Alert.alert('خطا', 'مشکل در بارگذاری اطلاعات');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const recordTime = async (serviceFunction, field, label) => {
    if (todayData[field]) {
      Alert.alert('توجه', `${label} قبلاً ثبت شده است`);
      return;
    }

    const persianDate = await getTodayForAPI();
    if (!persianDate) {
      Alert.alert('خطا', 'مشکل در دریافت تاریخ');
      return;
    }

    const now = new Date();
    const time = formatTimeForAPI(now);
    
    setLoading(true);
    const result = await serviceFunction(persianDate, time);
    setLoading(false);
    
    if (result.success) {
      await loadData();
      Alert.alert('ثبت شد', `${label} در ساعت ${formatTime(now)} ثبت شد`);
    } else {
      Alert.alert('خطا', result.message);
    }
  };

  const handleEndWork = async () => {
    if (!todayData.startWork) {
      Alert.alert('خطا', 'ابتدا شروع کار را ثبت کنید');
      return;
    }
    if (todayData.endWork) {
      Alert.alert('توجه', 'پایان کار قبلاً ثبت شده است');
      return;
    }
    await recordTime(endWork, 'endWork', 'پایان کار');
  };
const handleStopStartToggle = async () => {
    if (!todayData.startWork || todayData.endWork) {
      Alert.alert('خطا', 'امکان توقف در این وضعیت وجود ندارد');
      return;
    }

    const persianDate = await getTodayForAPI();
    if (!persianDate) {
      Alert.alert('خطا', 'مشکل در دریافت تاریخ');
      return;
    }

    const now = new Date();
    const time = formatTimeForAPI(now);
    
    setLoading(true);
    let result;
    
    if (isStopped) {
      // اگر متوقف بود، شروع مجدد
      result = await startStopTime(persianDate, time);
    } else {
      // اگر در حال کار بود، توقف
      result = await stopTime(persianDate, time);
    }
    
    setLoading(false);
    
    if (result.success) {
      setIsStopped(!isStopped); // تغییر وضعیت
      await loadData(); // بارگذاری مجدد آمار
      Alert.alert('موفق', result.message || (isStopped ? 'کار ادامه یافت' : 'کار متوقف شد'));
    } else {
      Alert.alert('خطا', result.message);
    }
  };

  // ✅ تابع هندل برای ثبت دستی کسر زمان
  const handleAddManualTime = async () => {
    if (!manualTime) {
      Alert.alert('خطا', 'لطفاً زمان را وارد کنید');
      return;
    }

    // اعتبارسنجی ساده فرمت زمان (مثلاً 01:30)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(manualTime)) {
      Alert.alert('خطا', 'فرمت زمان صحیح نیست. مثال: 01:30');
      return;
    }

    const persianDate = await getTodayForAPI();
    if (!persianDate) {
      Alert.alert('خطا', 'مشکل در دریافت تاریخ');
      return;
    }

    setLoading(true);
    const result = await addStopTime(persianDate, manualTime);
    setLoading(false);
    
    if (result.success) {
      setModalVisible(false);
      setManualTime('');
      await loadData();
      Alert.alert('ثبت شد', result.message || 'زمان با موفقیت کسر شد');
    } else {
      Alert.alert('خطا', result.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'خروج از حساب',
      'آیا مطمئن هستید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          در حال بارگذاری...
        </Text>
      </View>
    );
  }

  const hasStarted = !!todayData.startWork;
  const hasEnded = !!todayData.endWork;
const canStop = hasStarted && !hasEnded; 
  return (
    <ScrollView style={globalStyles.container}>
      {/* هدر */} 
     
<View style={styles.header}>
  <View style={styles.headerContent}>
    {/* سمت راست: عنوان و تاریخ */}
    
    {/* سمت چپ: دکمه خروج و آواتار */}
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.exitText}>خروج</Text>
    </TouchableOpacity>
    <View style={styles.headerRight}>
      <Text style={styles.headerTitle}>⏱️ تایم من</Text>
      <PersianDate style={styles.headerDate} />
    </View>
  </View>
</View>

      {/* کارت آمار */}
      <View style={globalStyles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalHours}</Text>
            <Text style={styles.statLabel}>ساعت کاری</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.normalHours}</Text>
            <Text style={styles.statLabel}>عادی ({stats.normalWorkHours}h)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, stats.overtime > 0 && styles.overtime]}>
              {stats.overtime}
            </Text>
            <Text style={styles.statLabel}>اضافه کاری</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.missionHours}</Text>
            <Text style={styles.statLabel}>ماموریت</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.weekDay}</Text>
            <Text style={styles.statLabel}>روز هفته</Text>
          </View>
        </View>
      </View>

      {/* دکمه‌ها */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <TimeButton
              icon="clock"
              title="شروع کار"
              subtitle={hasStarted ? formatTime(todayData.startWork) : 'ثبت نشده'}
              color={hasStarted ? colors.success : colors.primary}
              onPress={() => recordTime(startWork, 'startWork', 'شروع کار')}
              disabled={hasStarted || hasEnded}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <TimeButton
              icon="briefcase"
              title="شروع ماموریت"
              subtitle={todayData.startMission ? formatTime(todayData.startMission) : 'ثبت نشده'}
              color={todayData.startMission ? colors.warning : colors.primary}
              onPress={() => recordTime(startMission, 'startMission', 'شروع ماموریت')}
              disabled={!hasStarted || !!todayData.startMission || hasEnded}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <TimeButton
              icon="check-circle"
              title="پایان ماموریت"
              subtitle={todayData.endMission ? formatTime(todayData.endMission) : 'ثبت نشده'}
              color={todayData.endMission ? colors.success : colors.primary}
              onPress={() => recordTime(endMission, 'endMission', 'پایان ماموریت')}
              disabled={!todayData.startMission || !!todayData.endMission || hasEnded}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <TimeButton
              icon="power"
              title="پایان کار"
              subtitle={todayData.endWork ? formatTime(todayData.endWork) : 'ثبت نشده'}
              color={todayData.endWork ? colors.danger : colors.danger}
              onPress={handleEndWork}
              disabled={!hasStarted || hasEnded}
            />
          </View>
        </View>
      </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <TimeButton
              icon={isStopped ? "play" : "pause"}
              title={isStopped ? "شروع مجدد" : "توقف کار"}
              subtitle={isStopped ? "متوقف شده" : "در حال کار"}
              color={isStopped ? colors.success : colors.warning}
              onPress={handleStopStartToggle}
              disabled={!canStop}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <TimeButton
              icon="minus-circle"
              title="کسر زمان"
              subtitle="ثبت دستی"
              color={colors.textSecondary}
              onPress={() => setModalVisible(true)}
              disabled={!canStop}
            />
          </View>
        </View>
      {/* دکمه تاریخچه */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Icon name="calendar" size={20} color={colors.primary} />
        <Text style={styles.historyButtonText}>مشاهده تاریخچه روزهای قبل</Text>
        <Icon name="chevron-left" size={20} color={colors.primary} />
      </TouchableOpacity>
       <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>کسر زمان دلخواه</Text>
            <Text style={styles.modalSubtitle}>
              زمان مورد نظر را به فرمت HH:MM وارد کنید (مثال: 01:30)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="01:30"
              value={manualTime}
              onChangeText={setManualTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              textAlign="center"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setManualTime('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddManualTime}
              >
                <Text style={styles.modalButtonTextConfirm}>ثبت</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
   header: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end', 
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '12',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.danger + '20',
  },
  exitText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 6,
  },
 
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  overtime: {
    color: colors.danger,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginHorizontal: 8,
  }, modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    color: colors.text,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: '600',
  },
});