import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileField({ label, value, onChangeText, editable = true }) {
  const themeContext = useTheme();
  const defaultColors = {
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    surface: '#FFFFFF',
  };
  
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  }
  
  if (!theme.colors) {
    theme.colors = { ...defaultColors };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface 
          },
          !editable && { 
            backgroundColor: theme.isDarkMode ? '#2D3748' : '#f0f0f0',
            color: theme.colors.textSecondary 
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={`Tu ${label.toLowerCase()}`}
        placeholderTextColor={theme.colors.textSecondary}
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnly: {
    backgroundColor: '#f0f0f0',
  },
});
