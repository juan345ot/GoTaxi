import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.label}>Correo:</Text>
      <Text style={styles.text}>{user?.email}</Text>

      <Button title="Editar perfil" onPress={() => navigation.navigate('EditProfile')} />
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    marginBottom: 20,
    fontSize: 16,
  },
});
