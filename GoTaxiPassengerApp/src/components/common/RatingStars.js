import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

export default function RatingStars({ value = 0, max = 5, onChange, size = 32, disabled = false, editable = true }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => !disabled && editable && onChange && onChange(idx + 1)}
          disabled={disabled || !editable}
          style={styles.starBtn}
        >
          <Ionicons
            name={idx < value ? 'star' : 'star-outline'}
            size={size}
            color={idx < value ? colors.accent : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  starBtn: {
    padding: 2,
  },
});
