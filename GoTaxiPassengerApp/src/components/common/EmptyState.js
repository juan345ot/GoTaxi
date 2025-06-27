import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

export default function EmptyState({ icon = 'folder-open', message = 'No hay resultados' }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.border} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 60,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
