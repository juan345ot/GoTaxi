import React, { forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const ChatInput = forwardRef(({ value, onChangeText, onSend }, ref) => {
  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#aaa"
        multiline
      />
      <TouchableOpacity onPress={onSend} style={styles.sendButton}>
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
});

export default ChatInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    color: colors.text,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 10,
  },
});
