// src/components/TimeButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export const TimeButton = ({
  icon,
  title,
  subtitle,
  onPress,
  color = '#007AFF',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Icon name={icon} size={28} color="#FFFFFF" />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});