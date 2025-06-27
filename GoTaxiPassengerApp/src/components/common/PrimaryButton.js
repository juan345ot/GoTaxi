import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconSize = 20,
  variant = 'primary',
}) {
  const background = {
    primary: colors.primary,
    secondary: colors.accent,
    danger: colors.error,
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: background[variant] || colors.primary }]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={iconSize} color="#fff" style={styles.icon} />}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 45,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
});
