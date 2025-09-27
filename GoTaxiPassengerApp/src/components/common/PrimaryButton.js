import React, { memo } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrimaryButton = memo(function PrimaryButton({ title, onPress, disabled, loading, style, textStyle, icon }) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.btn, isDisabled ? styles.btnDisabled : null, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID="primary-button"
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color="#fff" 
              style={styles.icon} 
            />
          )}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default PrimaryButton;