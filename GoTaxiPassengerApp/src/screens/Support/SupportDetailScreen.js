import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { colors } from '../../styles/theme';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';

const MOCK_RECLAMOS = [
  {
    id: '1',
    subject: 'Viaje no completado',
    message: 'El conductor no llegó y se me cobró',
    date: '2025-06-26T10:00:00Z',
  },
  {
    id: '2',
    subject: 'Olvidé algo en el auto',
    message: '¿Cómo puedo recuperar mi mochila?',
    date: '2025-06-25T15:42:00Z',
  },
];

export default function SupportDetailScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {MOCK_RECLAMOS.length === 0 ? (
        <EmptyState icon="chatbubble-ellipses" message="Sin reclamos enviados aún" />
      ) : (
        <FlatList
          data={MOCK_RECLAMOS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: colors.text,
  },
});
