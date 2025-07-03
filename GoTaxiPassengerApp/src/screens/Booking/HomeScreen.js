import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../../components/common/PrimaryButton';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/theme';
import useAuth from '../../hooks/useAuth';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Text style={typography.heading}>
        ¡Hola{user?.name ? `, ${user.name}` : ''}! 👋
      </Text>
      <Text style={styles.subtext}>¿Qué querés hacer hoy?</Text>

      <PrimaryButton
        title="Solicitar un Taxi"
        icon="car"
        onPress={() => handleNavigate('RideRequest')}
      />
      <PrimaryButton
        title="Ver Historial"
        icon="time"
        onPress={() => handleNavigate('History')}
        variant="secondary"
      />
      <PrimaryButton
        title="Mi Perfil"
        icon="person"
        onPress={() => handleNavigate('Profile')}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  subtext: {
    fontSize: 16,
    marginBottom: 30,
    color: colors.textSecondary,
  },
});
