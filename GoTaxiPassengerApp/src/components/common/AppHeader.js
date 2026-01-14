import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../navigation/routes';
import useAuth from '../../hooks/useAuth';
import avatarImg from '../../../assets/images/avatar-default.png';

export default function AppHeader({ showBackButton = true, onBackPress, onProfilePress }) {
  const navigation = useNavigation();
  const themeContext = useTheme();
  
  const defaultColors = {
    surface: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
  };
  
  // Validar y crear el tema de forma segura
  let theme;
  if (themeContext?.theme?.colors) {
    theme = themeContext.theme;
  } else {
    theme = {
      colors: { ...defaultColors },
    };
  }
  
  // Garantizar que colors siempre exista
  if (!theme.colors) {
    theme.colors = { ...defaultColors };
  } else {
    // Asegurar que todos los colores estén presentes
    theme.colors = {
      ...defaultColors,
      ...theme.colors,
    };
  }
  
  const { user } = useAuth();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      // Intentar navegar a la pantalla de perfil usando el nombre del DrawerNavigator
      try {
        navigation.navigate('Perfil');
      } catch (error) {
        // Si falla, intentar abrir el drawer
        try {
          if (navigation.openDrawer) {
            navigation.openDrawer();
          }
        } catch (e) {
          console.warn('No se pudo navegar al perfil:', e);
        }
      }
    }
  };

  const userAvatar = user?.avatar || user?.photo || user?.foto || null;

  // Validación final antes de renderizar
  const safeTheme = theme?.colors ? theme : {
    colors: { ...defaultColors },
  };

  return (
    <View style={[styles.header, { backgroundColor: safeTheme.colors.surface, borderBottomColor: safeTheme.colors.border }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
                        <Ionicons name="arrow-back" size={24} color={safeTheme.colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => {
          try {
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
                      routes: [{ name: 'Inicio' }],
                      index: 0,
                    }
                  }],
                })
              );
            } else {
              // Si estamos en el Drawer, intentar navegar directamente
              try {
                navigation.navigate('Inicio');
              } catch (e) {
                // Si falla, usar reset como fallback
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ 
                      name: ROUTES.HOME,
                      state: {
                        routes: [{ name: 'Inicio' }],
                        index: 0,
                      }
                    }],
                  })
                );
              }
            }
          } catch (error) {
            console.error('Error navegando a Inicio:', error);
            // Último recurso: resetear a HOME
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ 
                  name: ROUTES.HOME,
                  state: {
                    routes: [{ name: 'Inicio' }],
                    index: 0,
                  }
                }],
              })
            );
          }
        }} style={styles.appNameContainer}>
          <View style={styles.logoRow}>
            <View style={styles.goBox}>
              <Text style={styles.goText}>Go</Text>
            </View>
            <View style={styles.taxiBox}>
              <Text style={styles.taxiText}>TAXI</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={handleProfilePress}
        style={styles.profileButton}
        activeOpacity={0.7}
      >
        <Image
          source={userAvatar ? { uri: userAvatar } : avatarImg}
          style={styles.profileAvatar}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  appNameContainer: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'flex-start',
  },
  goBox: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  goText: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  taxiBox: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  taxiText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
});
