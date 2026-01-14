import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/common/AppHeader';
import ProfileMenu from '../../components/common/ProfileMenu';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useTheme } from '../../contexts/ThemeContext';
import { showToast } from '../../utils/toast';
import * as addressApi from '../../api/user';

export default function AddressesScreen() {
  const navigation = useNavigation();
  
  // Obtener tema con validación robusta
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Error obteniendo tema:', error);
    themeContext = null;
  }
  
  const defaultColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  };
  
  // Validar y crear el tema de forma segura
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  }
  
  // Garantizar que colors siempre exista
  if (!theme || !theme.colors) {
    theme = { isDarkMode: false, colors: { ...defaultColors } };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }
  
  // Validación final antes de renderizar
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };
  const [addresses, setAddresses] = useState([]);
  const [nombre, setNombre] = useState('');
  const [calle, setCalle] = useState('');
  const [altura, setAltura] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Cargar direcciones guardadas
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async() => {
    setLoadingAddresses(true);
    try {
      const response = await addressApi.getAddresses();
      // El backend devuelve { success: true, data: [...], message: '...' }
      // O puede devolver directamente el array si viene de res.data
      const addressesData = response?.data || (Array.isArray(response) ? response : []);
      setAddresses(Array.isArray(addressesData) ? addressesData : []);
    } catch (error) {
      console.error('Error cargando direcciones:', error);
      showToast('No se pudieron cargar las direcciones');
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = useCallback(async() => {
    if (!nombre?.trim()) {
      showToast('El nombre de la dirección es obligatorio');
      return;
    }
    if (!calle?.trim()) {
      showToast('La calle es obligatoria');
      return;
    }
    if (!ciudad?.trim()) {
      showToast('La ciudad es obligatoria');
      return;
    }

    setLoading(true);
    try {
      const direccionCompleta = `${calle.trim()} ${altura.trim()}, ${ciudad.trim()}`.trim();
      
      const addressData = {
        nombre: nombre.trim(),
        calle: calle.trim(),
        altura: altura.trim() || undefined,
        ciudad: ciudad.trim(),
        direccionCompleta,
      };

      const response = await addressApi.createAddress(addressData);
      const newAddress = response?.data || response;

      // Recargar direcciones desde el backend
      await loadAddresses();

      // Limpiar formulario
      setNombre('');
      setCalle('');
      setAltura('');
      setCiudad('');

      showToast('Dirección guardada exitosamente');
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'No se pudo guardar la dirección';
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [nombre, calle, altura, ciudad]);

  const handleDeleteAddress = useCallback((addressId) => {
    Alert.alert(
      'Eliminar Dirección',
      '¿Estás seguro de que querés eliminar esta dirección?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: async() => {
            try {
              await addressApi.deleteAddress(addressId);
              // Recargar direcciones desde el backend
              await loadAddresses();
              showToast('Dirección eliminada');
            } catch (error) {
              const errorMsg = error?.response?.data?.message || 'No se pudo eliminar la dirección';
              showToast(errorMsg);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  const renderAddressItem = ({ item }) => {
    // El backend devuelve _id, pero también puede venir como id
    const addressId = item._id || item.id;
    
    return (
      <View style={[styles.addressItem, { backgroundColor: safeTheme.colors.surface }]}>
        <View style={styles.addressInfo}>
          <View style={styles.addressHeader}>
            <Ionicons name="location" size={20} color={safeTheme.colors.primary} style={styles.addressIcon} />
            <Text style={[styles.addressName, { color: safeTheme.colors.text }]}>{item.nombre}</Text>
          </View>
          <Text style={[styles.addressText, { color: safeTheme.colors.textSecondary }]}>{item.direccionCompleta}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAddress(addressId)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={20} color="#e53935" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]} edges={['top', 'bottom']}>
      <AppHeader showBackButton={true} onProfilePress={() => setShowProfileMenu(true)} />
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: safeTheme.colors.text }]}>Mis Direcciones</Text>
        <Text style={[styles.subtitle, { color: safeTheme.colors.textSecondary }]}>Agregá direcciones que usás frecuentemente</Text>

        {/* Formulario para agregar dirección */}
        <View style={[styles.formContainer, { backgroundColor: safeTheme.colors.surface }]}>
          <Text style={[styles.formTitle, { color: safeTheme.colors.text }]}>Agregar Nueva Dirección</Text>
          <InputField
            label="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Casa, Trabajo, etc."
            icon="bookmark"
          />
          <InputField
            label="Calle"
            value={calle}
            onChangeText={setCalle}
            placeholder="Nombre de la calle"
            icon="map"
          />
          <InputField
            label="Altura"
            value={altura}
            onChangeText={setAltura}
            placeholder="Número"
            icon="home"
            keyboardType="numeric"
          />
          <InputField
            label="Ciudad"
            value={ciudad}
            onChangeText={setCiudad}
            placeholder="Ciudad"
            icon="location"
          />
          <PrimaryButton
            title="Guardar Dirección"
            icon="add-circle"
            onPress={handleAddAddress}
            loading={loading}
          />
        </View>

        {/* Lista de direcciones guardadas */}
        <View style={styles.listContainer}>
          <Text style={[styles.listTitle, { color: safeTheme.colors.text }]}>Direcciones Guardadas</Text>
          {loadingAddresses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={safeTheme.colors.primary} />
              <Text style={[styles.loadingText, { color: safeTheme.colors.textSecondary }]}>Cargando direcciones...</Text>
            </View>
          ) : addresses.length > 0 ? (
            <FlatList
              data={addresses}
              keyExtractor={(item) => item._id || item.id || String(item.createdAt)}
              renderItem={renderAddressItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: safeTheme.colors.border }]} />}
            />
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: safeTheme.colors.surface }]}>
              <Ionicons name="location-outline" size={48} color={safeTheme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: safeTheme.colors.text }]}>No tenés direcciones guardadas</Text>
              <Text style={[styles.emptySubtext, { color: safeTheme.colors.textSecondary }]}>Agregá una dirección usando el formulario de arriba</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  listContainer: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressIcon: {
    marginRight: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    marginLeft: 28,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
