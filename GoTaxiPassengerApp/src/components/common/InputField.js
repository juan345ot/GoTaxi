import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  icon,
  iconPosition = 'left',
  keyboardType = 'default',
  returnKeyType = 'done',
  accessibilityLabel,
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={20} color={colors.textSecondary} style={styles.icon} />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          accessibilityLabel={accessibilityLabel || placeholder}
        />

        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={20} color={colors.textSecondary} style={styles.icon} />
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  icon: {
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    color: colors.error,
    marginTop: 4,
    fontSize: 13,
  },
});
