import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/theme';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { showToast } from '../../utils/toast';

const MOCK_RECLAMOS = [
  {
    id: '1',
    subject: 'Viaje no completado',
    message: 'El conductor no llegó y se me cobró',
    date: '2025-06-26T10:00:00Z',
    status: 'pendiente',
    respuesta: '',
  },
  {
    id: '2',
    subject: 'Olvidé algo en el auto',
    message: '¿Cómo puedo recuperar mi mochila?',
    date: '2025-06-25T15:42:00Z',
    status: 'respondido',
    respuesta: 'Nos comunicamos con el conductor y te avisamos.',
  },
];

export default function SupportDetailScreen() {
  const [reclamos, setReclamos] = useState(MOCK_RECLAMOS);
  const [responseInput, setResponseInput] = useState('');

  const handleResponder = (id) => {
    setReclamos((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? { ...rec, status: 'respondido', respuesta: responseInput }
          : rec
      )
    );
    showToast('Respuesta enviada (simulada)');
    setResponseInput('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text
        style={[
          styles.status,
          item.status === 'pendiente' ? styles.pending : styles.answered,
        ]}
      >
        {item.status === 'pendiente' ? 'Pendiente' : 'Respondido'}
      </Text>
      {item.status === 'respondido' && (
        <Text style={styles.respuesta}>Respuesta: {item.respuesta}</Text>
      )}
      {item.status === 'pendiente' && (
        <>
          <TextInput
            style={styles.input}
            value={responseInput}
            onChangeText={setResponseInput}
            placeholder="Responder al reclamo..."
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleResponder(item.id)}
          >
            <Text style={styles.btnText}>Enviar Respuesta</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {reclamos.length === 0 ? (
        <EmptyState icon="chatbubble-ellipses" message="Sin reclamos enviados aún" />
      ) : (
        <FlatList
          data={reclamos}
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
    marginBottom: 4,
  },
  status: {
    fontWeight: '700',
    marginBottom: 5,
  },
  pending: {
    color: colors.error,
  },
  answered: {
    color: colors.success,
  },
  respuesta: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 2,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
