import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export default function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, style, ...props }) {
  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label} accessibilityLabel={label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
        autoCapitalize="none"
        accessible
        accessibilityLabel={label || placeholder}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.3,
    borderColor: '#e0e0e0',
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 17,
    color: '#222',
    backgroundColor: '#fff',
    minHeight: 48,
  },
});
