import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, Share, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

export default function ShareLocationModal({ visible, onClose, location }) {
  const locationText = `Mi ubicación actual: ${location || 'Ubicación no disponible'}`;
  const locationUrl = `https://maps.google.com/?q=${location || '0,0'}`;

  const handleCopyLocation = async () => {
    try {
      await Clipboard.setString(locationText);
      Alert.alert('Copiado', 'Ubicación copiada al portapapeles');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar la ubicación');
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      const message = `${locationText}\n\nVer en mapa: ${locationUrl}`;
      await Share.share({
        message: message,
        url: locationUrl,
        title: 'Mi ubicación - GoTaxi'
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir por WhatsApp');
    }
  };

  const handleShareGeneral = async () => {
    try {
      await Share.share({
        message: `${locationText}\n\nVer en mapa: ${locationUrl}`,
        url: locationUrl,
        title: 'Mi ubicación - GoTaxi'
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la ubicación');
    }
  };

  const handleShareSMS = async () => {
    try {
      const message = `${locationText}\n\nVer en mapa: ${locationUrl}`;
      await Share.share({
        message: message,
        title: 'Mi ubicación - GoTaxi'
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir por SMS');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="location" size={40} color="#007AFF" />
            <Text style={styles.title}>Compartir Ubicación</Text>
          </View>
          
          <Text style={styles.description}>
            Selecciona cómo quieres compartir tu ubicación actual:
          </Text>

          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={handleCopyLocation}>
              <Ionicons name="copy" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Copiar ubicación</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleShareWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.optionText}>Compartir por WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleShareSMS}>
              <Ionicons name="chatbubble" size={24} color="#34C759" />
              <Text style={styles.optionText}>Compartir por SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleShareGeneral}>
              <Ionicons name="share" size={24} color="#FF9500" />
              <Text style={styles.optionText}>Otras opciones</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
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
    color: '#007AFF',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
});
