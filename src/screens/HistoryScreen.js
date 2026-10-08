// src/screens/HistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { colors, globalStyles } from '../styles/globalStyles';
import { getHistory } from '../services/timeSheetService';
import { formatTime, getPersianMonths } from '../utils/dateUtils';

export default function HistoryScreen({ navigation }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const result = await getHistory(year, month);
      
      if (result.success && result.data) {
        setDays(result.data);
      } else {
        setDays([]);
      }
    } catch (error) {
      console.error('خطا در بارگذاری:', error);
      Alert.alert('خطا', 'مشکل در بارگذاری تاریخچه');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteDay = (key) => {
    Alert.alert(
      'حذف روز',
      'آیا مطمئن هستید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            // TODO: API حذف
            await loadData();
          },
        },
      ]
    );
  };

  

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.dayCard}
        onPress={() => navigation.navigate('EditDay', { dayKey: item.persianDate })}
        onLongPress={() => handleDeleteDay(item.persianDate)}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayDate}>{item.persianDate || '--'}</Text>
            <Text style={styles.dayWeekDay}>{item.weekDay || '--'}</Text>
          </View>
          <View style={styles.dayTotals}>
            <Text style={styles.dayTotal}>{item.totalHours || 0} ساعت</Text>
            {item.normalWorkHours > 0 && (
              <Text style={styles.dayNormal}>({item.normalHours || 0} عادی)</Text>
            )}
          </View>
        </View>

        <View style={styles.dayDetails}>
          <View style={styles.detailItem}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              شروع: {item.startWorkTime || '--:--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              پایان: {item.endWorkTime || '--:--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="briefcase" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              ماموریت: {item.missionHours || 0}h
            </Text>
          </View>
          {(item.overtime || 0) > 0 && (
            <View style={[styles.detailItem, styles.overtimeItem]}>
              <Icon name="star" size={14} color={colors.danger} />
              <Text style={styles.overtimeText}>
                اضافه کاری: {item.overtime || 0}h
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="calendar" size={80} color={colors.border} />
      <Text style={styles.emptyTitle}>هیچ روزی ثبت نشده است</Text>
      <Text style={styles.emptySubtitle}>
        برای ثبت زمان، به صفحه اصلی بروید
      </Text>
      <TouchableOpacity
        style={styles.goHomeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.goHomeButtonText}>رفتن به صفحه اصلی</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          در حال بارگذاری تاریخچه...
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-right" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تاریخچه</Text>
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={handleExportExcel}
        >
          <Icon name="file-text" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={days}
        renderItem={renderItem}
        keyExtractor={(item) => item.persianDate || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  exportButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dayWeekDay: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayTotals: {
    alignItems: 'flex-end',
  },
  dayTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dayNormal: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dayDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  overtimeItem: {
    backgroundColor: '#FFF3F0',
  },
  overtimeText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  goHomeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  goHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});