import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../../styles/theme';
import { formatDate } from '../../utils/formatDate';

export default function MessageBubble({ message, sender, time, isOwn, avatar }) { // ✅ Nueva prop agregada (avatar)
  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      {!isOwn && avatar && (
        <Image source={{ uri: avatar }} style={styles.avatar} /> // ✅ Avatar mostrado si no es mensaje propio
      )}
      <View style={styles.messageContent}>
        <Text style={styles.text}>{message}</Text>
        <Text style={styles.timestamp}>{formatDate(time)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    maxWidth: '80%',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  ownMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderRadius: 8,
    padding: 10,
  },
  otherMessage: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
  },
  messageContent: {
    flex: 1,
  },
  text: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#eee',
    marginTop: 4,
    textAlign: 'right',
  },
});
