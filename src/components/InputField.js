// src/components/InputField.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../styles/globalStyles';

export const InputField = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry,
  error,
  keyboardType,
  autoCapitalize,
  maxLength,
  icon,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.focused,
        error && styles.errorBorder,
      ]}>
        {icon && (
          <Icon 
            name={icon} 
            size={20} 
            color={error ? colors.danger : isFocused ? colors.primary : colors.textSecondary}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder || '#999'}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          maxLength={maxLength}
          editable={editable}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Icon 
              name={showPassword ? 'eye' : 'eye-off'} 
              size={20} 
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text || '#1C1C1E',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background || '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border || '#E5E5EA',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text || '#1C1C1E',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  icon: {
    marginRight: 8,
  },
  focused: {
    borderColor: colors.primary || '#007AFF',
    borderWidth: 2,
  },
  errorBorder: {
    borderColor: colors.danger || '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: colors.danger || '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  eyeButton: {
    padding: 4,
  },
});