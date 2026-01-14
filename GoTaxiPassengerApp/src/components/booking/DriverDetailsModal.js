import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '../common/RatingStars';

export default function DriverDetailsModal({ visible, driver, vehicle, onClose, onCall, onChat, theme }) {
  if (!driver) return null;

  const defaultColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  };

  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: safeTheme.colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: safeTheme.colors.border }]}>
            <Text style={[styles.title, { color: safeTheme.colors.text }]}>Detalles del Conductor</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={safeTheme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.avatarContainer}>
              <Image
                source={driver?.avatar ? { uri: driver.avatar } : require('../../../assets/images/driver1.png')}
                style={styles.avatar}
              />
              <Text style={[styles.driverName, { color: safeTheme.colors.text }]}>{driver?.name}</Text>
              <RatingStars value={driver?.rating || 0} size={20} disabled />
            </View>

            <View style={[styles.section, { borderBottomColor: safeTheme.colors.border }]}>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={safeTheme.colors.primary} style={styles.icon} />
                <View style={styles.infoContent}>
                  <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>Teléfono</Text>
                  <Text style={[styles.value, { color: safeTheme.colors.text }]}>{driver?.phone || 'No disponible'}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.section, { borderBottomColor: safeTheme.colors.border }]}>
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={20} color={safeTheme.colors.primary} style={styles.icon} />
                <View style={styles.infoContent}>
                  <Text style={[styles.label, { color: safeTheme.colors.textSecondary }]}>Vehículo</Text>
                  <Text style={[styles.value, { color: safeTheme.colors.text }]}>{vehicle || 'No disponible'}</Text>
                </View>
              </View>
            </View>

            {driver?.carImage && (
              <View style={styles.carImageContainer}>
                <Image source={{ uri: driver.carImage }} style={styles.carImage} resizeMode="cover" />
              </View>
            )}

            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: safeTheme.colors.primary }]}
              onPress={onCall}
            >
              <Ionicons name="call" size={20} color="#fff" style={styles.callIcon} />
              <Text style={styles.callButtonText}>Llamar al Conductor</Text>
            </TouchableOpacity>

            {onChat && (
              <TouchableOpacity
                style={[styles.messageButton, { 
                  backgroundColor: safeTheme.colors.isDarkMode ? '#1E3A5F' : '#E3F2FD',
                  borderColor: safeTheme.colors.primary 
                }]}
                onPress={onChat}
              >
                <Ionicons name="chatbubbles" size={20} color={safeTheme.colors.primary} style={styles.messageIcon} />
                <Text style={[styles.messageButtonText, { color: safeTheme.colors.primary }]}>Enviar Mensaje al Conductor</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  carImageContainer: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  carImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  callIcon: {
    marginRight: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 2,
  },
  messageIcon: {
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
