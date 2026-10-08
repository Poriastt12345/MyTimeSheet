// src/components/PersianDate.js
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { getTodayDate } from '../services/dateService';
import { colors } from '../styles/globalStyles';

export const PersianDate = ({ style, showWeekDay = true }) => {
  const [date, setDate] = useState('');
  const [weekDay, setWeekDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [isHolyDay, setIsHolyDay] = useState(false);

  useEffect(() => {
    loadDate();
  }, []);

  const loadDate = async () => {
    setLoading(true);
    const result = await getTodayDate();
    
    if (result.success) {
      const { persianDate, wd, isHolyDay } = result.data;
      setDate(persianDate);
      setWeekDay(wd || '');
      setIsHolyDay(isHolyDay || false);
    } else {
      // اگر API خطا داد، از تاریخ محلی استفاده کن
      const fallbackDate = new Date();
      setDate(`${fallbackDate.getFullYear()}/${fallbackDate.getMonth() + 1}/${fallbackDate.getDate()}`);
      setWeekDay('---');
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showWeekDay && weekDay ? (
        <Text style={[styles.weekDayText, style, isHolyDay && styles.holyDay]}>
          {weekDay}
        </Text>
      ) : null}
      <Text style={[styles.dateText, style, isHolyDay && styles.holyDay]}>
        {date}
      </Text>
      {isHolyDay && (
        <Text style={styles.holyDayText}>🕌 تعطیل</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    margin:6,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    margin: 6,
  },
  holyDay: {
    color: '#FF3B30',
  },
  holyDayText: {
    fontSize: 12,
    color: '#FF3B30',
    margin: 6,
  },
});