import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';
import { typography } from '../../styles/typography';

export default function BookingConfirmationModal({
  visible,
  origin,
  destination,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  customConfirmText, // ✅ Nueva prop agregada
  customCancelText,  // ✅ Nueva prop agregada
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[typography.heading, { marginBottom: 10 }]}>¿Confirmar viaje?</Text>
          <Text style={styles.label}>Origen:</Text>
          <Text style={styles.text}>{origin}</Text>
          <Text style={styles.label}>Destino:</Text>
          <Text style={styles.text}>{destination}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.buttonText}>{customCancelText || cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.buttonText}>{customConfirmText || confirmText}</Text>
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
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 8,
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  text: {
    marginBottom: 8,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancel: {
    backgroundColor: colors.error,
  },
  confirm: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
});
