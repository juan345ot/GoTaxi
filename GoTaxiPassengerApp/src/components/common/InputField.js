import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  autoFocus = false,
  onSubmitEditing,
  editable = true,
  ...props
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        error && { borderColor: '#e53935', borderWidth: 1.2 },
        !editable && { backgroundColor: '#f2f2f2' }
      ]}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={20} color="#007aff" style={styles.icon} />
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
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          placeholderTextColor="#bbb"
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={20} color="#007aff" style={styles.icon} />
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
    marginLeft: 4,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    shadowColor: '#222',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 1 },
  },
  icon: {
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
  },
  error: {
    color: '#e53935',
    marginTop: 3,
    fontSize: 12,
    marginLeft: 4,
  },
});
