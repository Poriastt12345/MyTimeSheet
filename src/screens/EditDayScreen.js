// src/screens/EditDayScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';

import { colors, globalStyles } from '../styles/globalStyles';
import { getDayData, saveDayData } from '../utils/storage';
import { formatTime, calculateDayStats } from '../utils/dateUtils';

export default function EditDayScreen({ route, navigation }) {
  const { dayKey } = route.params;
  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState({});
  const [showPicker, setShowPicker] = useState({ field: null, show: false });
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDayData(dayKey);
      setDayData(data || {});
      const calculatedStats = calculateDayStats(data || {});
      setStats(calculatedStats);
    } catch (error) {
      console.error('خطا در بارگذاری:', error);
      Alert.alert('خطا', 'مشکل در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  const updateTime = (field, event, selectedDate) => {
    setShowPicker({ field: null, show: false });
    if (selectedDate) {
      const newData = { ...dayData, [field]: selectedDate.toISOString() };
      setDayData(newData);
      const calculatedStats = calculateDayStats(newData);
      setStats(calculatedStats);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await saveDayData(dayKey, dayData);
    setLoading(false);
    
    if (result) {
      Alert.alert('ذخیره شد', 'تغییرات با موفقیت ذخیره شد');
      navigation.goBack();
    } else {
      Alert.alert('خطا', 'مشکل در ذخیره تغییرات');
    }
  };

  const renderTimeRow = (label, field) => {
    const isStartWork = field === 'startWork';
    const isEndWork = field === 'endWork';
    const isStartMission = field === 'startMission';
    const isEndMission = field === 'endMission';
    
    let iconName = 'clock';
    let iconColor = colors.primary;
    
    if (isStartWork) { iconName = 'log-in'; iconColor = colors.success; }
    else if (isEndWork) { iconName = 'log-out'; iconColor = colors.danger; }
    else if (isStartMission) { iconName = 'briefcase'; iconColor = colors.warning; }
    else if (isEndMission) { iconName = 'check-circle'; iconColor = colors.success; }

    return (
      <TouchableOpacity
        style={styles.timeRow}
        onPress={() => setShowPicker({ field, show: true })}
        activeOpacity={0.7}
      >
        <View style={styles.timeLabelContainer}>
          <Icon name={iconName} size={20} color={iconColor} />
          <Text style={styles.timeLabel}>{label}</Text>
        </View>
        <View style={styles.timeValueContainer}>
          <Text style={[
            styles.timeValue,
            dayData[field] ? styles.timeFilled : styles.timeEmpty
          ]}>
            {dayData[field] ? formatTime(dayData[field]) : 'ثبت نشده'}
          </Text>
          <Icon name="edit-2" size={18} color={colors.primary} />
        </View>
        {showPicker.field === field && showPicker.show && (
          <DateTimePicker
            value={dayData[field] ? new Date(dayData[field]) : new Date()}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) => updateTime(field, event, selectedDate)}
          />
        )}
      </TouchableOpacity>
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

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-right" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ویرایش روز</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Icon name="check" size={24} color={colors.success} />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.dateTitle}>{dayKey}</Text>
        <Text style={styles.dateSubtitle}>{stats.weekDay}</Text>

        <View style={styles.statsPreview}>
          <View style={styles.previewItem}>
            <Text style={styles.previewValue}>{stats.totalHours}</Text>
            <Text style={styles.previewLabel}>کل ساعت</Text>
          </View>
          <View style={styles.previewDivider} />
          <View style={styles.previewItem}>
            <Text style={styles.previewValue}>{stats.normalHours}</Text>
            <Text style={styles.previewLabel}>عادی</Text>
          </View>
          <View style={styles.previewDivider} />
          <View style={styles.previewItem}>
            <Text style={[styles.previewValue, stats.overtime > 0 && styles.overtime]}>
              {stats.overtime}
            </Text>
            <Text style={styles.previewLabel}>اضافه کاری</Text>
          </View>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>ویرایش زمان‌ها</Text>
        <Text style={styles.sectionSubtitle}>
          برای تغییر هر زمان، روی آن ضربه بزنید
        </Text>

        {renderTimeRow('شروع کار', 'startWork')}
        {renderTimeRow('پایان کار', 'endWork')}
        {renderTimeRow('شروع ماموریت', 'startMission')}
        {renderTimeRow('پایان ماموریت', 'endMission')}
      </View>

      <TouchableOpacity style={styles.saveButtonLarge} onPress={handleSave}>
        <Icon name="save" size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    padding: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  dateSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewItem: {
    alignItems: 'center',
    flex: 1,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  overtime: {
    color: colors.danger,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  timeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  timeFilled: {
    color: colors.primary,
  },
  timeEmpty: {
    color: colors.textSecondary,
  },
  saveButtonLarge: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});