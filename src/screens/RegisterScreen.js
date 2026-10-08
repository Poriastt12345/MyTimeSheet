// src/screens/RegisterScreen.js
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
import { colors, globalStyles } from '../styles/globalStyles';
import { register } from '../services/authService';

// طرح اعتبارسنجی ثبت‌نام
const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('نام الزامی است')
    .min(2, 'نام حداقل ۲ کاراکتر باید باشد'),
  lastName: yup
    .string()
    .required('نام خانوادگی الزامی است')
    .min(2, 'نام خانوادگی حداقل ۲ کاراکتر باید باشد'),
  phoneNumber: yup
    .string()
    .required('شماره همراه الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود'),
  password: yup
    .string()
    .required('رمز عبور الزامی است')
    .min(6, 'رمز عبور حداقل ۶ کاراکتر باید باشد'),
  passwordConfirm: yup
    .string()
    .required('تکرار رمز عبور الزامی است')
    .oneOf([yup.ref('password')], 'رمز عبور و تکرار آن مطابقت ندارد'),
});

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    const result = await register(data);
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert(
        'ثبت‌نام موفق',
        'حساب کاربری شما با موفقیت ایجاد شد. حالا می‌توانید وارد شوید.',
        [
          {
            text: 'ورود',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-right" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ثبت‌نام</Text>
        </View>

        <View style={globalStyles.card}>
          <Text style={styles.title}>ایجاد حساب کاربری</Text>
          <Text style={styles.subtitle}>
            برای استفاده از اپلیکیشن ثبت‌نام کنید
          </Text>

          {/* نام */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value, onBlur } }) => (
              <InputField
                label="نام"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="نام خود را وارد کنید"
                icon="user"
                error={errors.name?.message}
              />
            )}
          />

          {/* نام خانوادگی */}
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value, onBlur } }) => (
              <InputField
                label="نام خانوادگی"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="نام خانوادگی خود را وارد کنید"
                icon="user"
                error={errors.lastName?.message}
              />
            )}
          />

          {/* شماره همراه */}
          <Controller
            control={control}
            name="phoneNumber"
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
                error={errors.phoneNumber?.message}
              />
            )}
          />

          {/* رمز عبور */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <InputField
                label="رمز عبور"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="حداقل ۶ کاراکتر"
                secureTextEntry={!showPassword}
                icon="lock"
                error={errors.password?.message}
              />
            )}
          />

          {/* تکرار رمز عبور */}
          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onChange, value, onBlur } }) => (
              <InputField
                label="تکرار رمز عبور"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="رمز عبور را دوباره وارد کنید"
                secureTextEntry={!showConfirmPassword}
                icon="lock"
                error={errors.passwordConfirm?.message}
              />
            )}
          />

          {/* دکمه ثبت‌نام */}
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
              <Text style={globalStyles.buttonText}>ثبت‌نام</Text>
            )}
          </TouchableOpacity>

          {/* لینک ورود */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>حساب کاربری دارید؟</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>وارد شوید</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
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