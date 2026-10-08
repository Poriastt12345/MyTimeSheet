// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';

import { InputField } from '../components/InputField';
import { PersianDate } from '../components/PersianDate';
import { colors, globalStyles } from '../styles/globalStyles';
import { login } from '../services/authService';

// طرح اعتبارسنجی لاگین
const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required('شماره همراه الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود'),
  password: yup
    .string()
    .required('رمز عبور الزامی است'),
});

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    // تبدیل به فرمت API
    const credentials = {
      phoneNumber: data.phone,
      password: data.password,
    };
    
    const result = await login(credentials);
    
    setLoading(false);
    
    if (result.success) {
      // لاگین موفق - رفتن به صفحه اصلی
      navigation.replace('Home');
    } else {
      Alert.alert('خطا', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* هدر با تاریخ شمسی */}
        <View style={styles.header}>
          <PersianDate style={styles.dateTime} />
          
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="clock" size={50} color={colors.primary} />
            </View>
            <Text style={styles.appName}>تایم من</Text>
            <Text style={styles.appSubtitle}>مدیریت ساعت کاری</Text>
          </View>
        </View>

        {/* فرم لاگین */}
        <View style={globalStyles.card}>
          <Text style={styles.welcomeText}>خوش آمدید</Text>
          <Text style={styles.welcomeSubtext}>
            برای ورود، شماره همراه و رمز عبور خود را وارد کنید
          </Text>

          {/* فیلد شماره همراه */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value, onBlur } }) => (
              <InputField
                label="شماره همراه"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                keyboardType="phone-pad"
                maxLength={11}
                icon="phone"
                error={errors.phone?.message}
              />
            )}
          />

          {/* فیلد رمز عبور */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <InputField
                label="رمز عبور"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="رمز عبور خود را وارد کنید"
                secureTextEntry={!showPassword}
                icon="lock"
                error={errors.password?.message}
              />
            )}
          />

          {/* دکمه نمایش رمز */}
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
            </Text>
          </TouchableOpacity>

          {/* دکمه ورود */}
          <TouchableOpacity
            style={[
              globalStyles.button,
              (!isValid || loading) && globalStyles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={globalStyles.buttonText}>ورود</Text>
            )}
          </TouchableOpacity>

          {/* لینک ثبت‌نام */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>حساب کاربری ندارید؟</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>ثبت‌نام کنید</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dateTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  showPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  showPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
});