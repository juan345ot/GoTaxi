import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';

export default function ProfileField({ label, value, onChangeText, editable = true }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.readOnly]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={`Tu ${label.toLowerCase()}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
  },
  readOnly: {
    backgroundColor: '#f0f0f0',
    color: colors.textSecondary,
  },
});
