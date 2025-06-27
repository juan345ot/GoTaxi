import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';
import { formatDate } from '../../utils/formatDate';

export default function MessageBubble({ message, sender, time, isOwn }) {
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>{message}</Text>
      <Text style={styles.timestamp}>{formatDate(time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    alignSelf: 'flex-start',
  },
  ownMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 15,
  },
  textOwn: {
    color: '#fff',
  },
  textOther: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 11,
    color: '#eee',
    marginTop: 4,
    textAlign: 'right',
  },
});

