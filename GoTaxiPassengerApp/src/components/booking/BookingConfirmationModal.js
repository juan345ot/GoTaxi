import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookingConfirmationModal({ visible, origin, destination, onConfirm, onCancel }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Ionicons name="help-circle-outline" size={40} color="#1E90FF" />
          <Text style={styles.title}>¿Confirmar viaje?</Text>
          <Text style={styles.text}>Origen: {origin}</Text>
          <Text style={styles.text}>Destino: {destination}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
              <Text style={styles.textSecondary}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonPrimary} onPress={onConfirm}>
              <Text style={styles.textPrimary}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  buttonPrimary: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  textPrimary: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textSecondary: {
    color: '#333',
    fontWeight: 'bold',
  },
});
