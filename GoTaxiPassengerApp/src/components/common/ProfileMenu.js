import React, { memo } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../navigation/routes';
import avatarImg from '../../../assets/images/avatar-default.png';

const ProfileMenu = memo(function ProfileMenu({ visible, onClose, navigation }) {
  const { user, logout } = useAuth();
  const themeContext = useTheme();
  const defaultColors = {
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };
  
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = { isDarkMode: false, toggleTheme: () => {}, colors: { ...defaultColors } };
  }
  
  if (!theme.colors) {
    theme.colors = { ...defaultColors };
  } else {
    theme.colors = { ...defaultColors, ...theme.colors };
  }
  
  const toggleTheme = themeContext?.toggleTheme || theme?.toggleTheme || (() => {});

  const handleNavigate = (routeName) => {
    if (!navigation) {
      console.warn('Navigation no disponible en ProfileMenu');
      return;
    }
    try {
      onClose();
      // Pequeño delay para asegurar que el modal se cierre antes de navegar
      setTimeout(() => {
        // Verificar si estamos en el Stack Navigator o en el Drawer Navigator
        const state = navigation.getState();
        const currentRoute = state?.routes[state?.index];
        const isInStack = currentRoute?.name === 'EditProfile' || currentRoute?.name === 'ChangePassword';
        
        if (isInStack) {
          // Si estamos en el Stack, usar CommonActions.reset directamente
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ 
                name: ROUTES.HOME,
                state: {
                  routes: [{ name: routeName }],
                  index: 0,
                }
              }],
            })
          );
        } else {
          // Si estamos en el Drawer, intentar navegar directamente
          try {
            navigation.navigate(routeName);
          } catch (e) {
            // Si falla, usar reset como fallback
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ 
                  name: ROUTES.HOME,
                  state: {
                    routes: [{ name: routeName }],
                    index: 0,
                  }
                }],
              })
            );
          }
        }
      }, 150);
    } catch (error) {
      console.error('Error navegando a', routeName, error);
      onClose();
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Mis Datos',
      icon: 'person-outline',
      onPress: () => handleNavigate('Perfil'),
    },
    {
      id: 'addresses',
      label: 'Mis Direcciones',
      icon: 'location-outline',
      onPress: () => handleNavigate('Mis Direcciones'),
    },
    {
      id: 'trips',
      label: 'Mis Viajes',
      icon: 'time-outline',
      onPress: () => handleNavigate('Historial de viajes'),
    },
    {
      id: 'support',
      label: 'Soporte Técnico',
      icon: 'help-buoy-outline',
      onPress: () => handleNavigate('Soporte'),
    },
  ];

  // Agregar botón de modo oscuro antes del logout
  const darkModeItem = {
    id: 'darkMode',
    label: theme.isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
    icon: theme.isDarkMode ? 'sunny-outline' : 'moon-outline',
    onPress: () => {
      toggleTheme();
    },
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    // Navegar a Login después del logout usando CommonActions para resetear el stack completo
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN }],
      })
    );
  };

  const userAvatar = user?.avatar || user?.photo || user?.foto || null;
  const userNombre = user?.nombre || user?.name || '';
  const userApellido = user?.apellido || user?.lastname || '';
  const userName = userNombre && userApellido 
    ? `${userNombre} ${userApellido}`.trim()
    : userNombre || userApellido || 'Usuario';
  const userEmail = user?.email || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Header del menú con info del usuario */}
          <View style={[styles.menuHeader, { borderBottomColor: theme.colors.border }]}>
            <Image
              source={userAvatar ? { uri: userAvatar } : avatarImg}
              style={styles.menuAvatar}
            />
            <View style={styles.menuUserInfo}>
              <Text style={[styles.menuUserName, { color: theme.colors.text }]}>{userName}</Text>
              {userEmail ? <Text style={[styles.menuUserEmail, { color: theme.colors.textSecondary }]}>{userEmail}</Text> : null}
            </View>
          </View>

          {/* Items del menú */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={22} color={theme.colors.text} style={styles.menuItemIcon} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
            {/* Botón de modo oscuro */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={darkModeItem.onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={darkModeItem.icon} size={22} color={theme.colors.text} style={styles.menuItemIcon} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{darkModeItem.label}</Text>
            </TouchableOpacity>
          </View>

          {/* Botón de logout */}
          <TouchableOpacity
            style={[styles.logoutButton, { borderTopColor: theme.colors.border }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#e53935" style={styles.menuItemIcon} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuUserEmail: {
    fontSize: 14,
  },
  menuItems: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
    borderTopWidth: 1,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#e53935',
    fontWeight: '600',
  },
});

ProfileMenu.displayName = 'ProfileMenu';

export default ProfileMenu;
