import React, { memo, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const InputField = memo(function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  isPassword,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  containerStyle,
  icon,
  ...rest
}) {
  const themeContext = useTheme();
  const defaultColors = {
    text: '#374151',
    textSecondary: '#6B7280',
    border: '#D1D5DB',
    surface: '#FFFFFF',
  };
  
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { colors: { ...defaultColors } };
  }
  
  if (!theme.colors) {
    theme.colors = { ...defaultColors };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }
  const [showPassword, setShowPassword] = useState(false);
  const shouldShowPasswordToggle = isPassword || secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}
      <View style={[styles.inputContainer, { 
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface 
      }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input, 
            { color: theme.colors.text },
            icon && styles.inputWithIcon, 
            shouldShowPasswordToggle && styles.inputWithPasswordToggle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={shouldShowPasswordToggle && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          placeholderTextColor={theme.colors.textSecondary}
          {...rest}
        />
        {shouldShowPasswordToggle && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 48,
  },
  icon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithPasswordToggle: {
    paddingRight: 40,
  },
  eyeIcon: {
    padding: 8,
    marginRight: 8,
  },
});

export default InputField;
