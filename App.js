// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, View, Text } from 'react-native';

import { colors } from './src/styles/globalStyles';
import { isLoggedIn } from './src/services/authService';

// صفحه‌ها
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import EditDayScreen from './src/screens/EditDayScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // بررسی وضعیت لاگین هنگام شروع برنامه
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // چک کردن اینکه کاربر لاگین هست یا نه
      const loggedIn = await isLoggedIn();
      console.log('وضعیت لاگین:', loggedIn ? 'وارد شده' : 'خارج');
      setUserLoggedIn(loggedIn);
    } catch (error) {
      console.error('خطا در بررسی وضعیت لاگین:', error);
      setUserLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // صفحه بارگذاری
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 16 }}>
          در حال بارگذاری...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={userLoggedIn ? 'Home' : 'Login'}
            screenOptions={{
              headerShown: false,
            }}
          >
            {/* صفحه‌های احراز هویت */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            
            {/* صفحه‌های اصلی (بعد از لاگین) */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="EditDay" component={EditDayScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}