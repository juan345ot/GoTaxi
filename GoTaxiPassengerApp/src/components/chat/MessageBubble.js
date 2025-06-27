import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ text, from }) {
  return (
    <View style={[styles.bubble, from === 'passenger' ? styles.passenger : styles.driver]}>
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: '70%',
  },
  passenger: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  driver: {
    backgroundColor: '#e6e6e6',
    alignSelf: 'flex-start',
  },
});