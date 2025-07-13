import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconSize = 20,
  style,
  textStyle,
  variant = 'primary',
}) {
  const background = {
    primary: '#007aff',
    secondary: '#ffd600',
    danger: '#e53935',
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: background[variant] || '#007aff' },
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={iconSize} color="#fff" style={styles.icon} />}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 1, height: 4 },
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  icon: {
    marginRight: 9,
  },
});
