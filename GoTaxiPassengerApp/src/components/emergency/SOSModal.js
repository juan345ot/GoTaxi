import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const EMERGENCY_SERVICES = {
  police: { name: 'Policía', number: '911', icon: 'shield' },
  ambulance: { name: 'Ambulancia', number: '107', icon: 'medical' },
  fire: { name: 'Bomberos', number: '100', icon: 'flame' }
};

export default function SOSModal({ visible, onClose }) {
  const handleEmergencyConfirm = () => {
    Alert.alert(
      '¿Estás en una emergencia real?',
      'Si confirmas que estás en una emergencia, se activará el protocolo de seguridad. Si no es una emergencia real, se puede aplicar una multa por uso indebido del sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, es una emergencia',
          style: 'destructive',
          onPress: () => {
            onClose();
            showEmergencyOptions();
          }
        }
      ]
    );
  };

  const showEmergencyOptions = () => {
    Alert.alert(
      'Servicios de Emergencia',
      'Selecciona el servicio que necesitas:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: `🚔 ${EMERGENCY_SERVICES.police.name}`,
          onPress: () => callEmergencyService(EMERGENCY_SERVICES.police)
        },
        {
          text: `🚑 ${EMERGENCY_SERVICES.ambulance.name}`,
          onPress: () => callEmergencyService(EMERGENCY_SERVICES.ambulance)
        },
        {
          text: `🚒 ${EMERGENCY_SERVICES.fire.name}`,
          onPress: () => callEmergencyService(EMERGENCY_SERVICES.fire)
        }
      ]
    );
  };

  const callEmergencyService = (service) => {
    const phoneNumber = `tel:${service.number}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'No se puede realizar la llamada');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'No se puede realizar la llamada');
      });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="warning" size={40} color="#e53935" />
            <Text style={styles.title}>Botón de Emergencia</Text>
          </View>
          
          <Text style={styles.description}>
            ¿Estás en una situación de emergencia real? Este botón activará el protocolo de seguridad.
          </Text>
          
          <Text style={styles.warning}>
            ⚠️ Si no es una emergencia real, se puede aplicar una multa por uso indebido del sistema.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencyConfirm}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.emergencyBtnText}>Sí, es emergencia</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53935',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  warning: {
    fontSize: 14,
    color: '#ff6b35',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  emergencyBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emergencyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
