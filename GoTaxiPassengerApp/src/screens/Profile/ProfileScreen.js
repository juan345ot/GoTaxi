import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState('es');

  const handleSave = () => {
    Alert.alert('Perfil actualizado (local)', `Nombre: ${name}\nIdioma: ${language}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Correo</Text>
      <TextInput
        style={styles.input}
        value={email}
        editable={false}
      />

      <Text style={styles.label}>Idioma</Text>
      <TextInput
        style={styles.input}
        value={language}
        onChangeText={setLanguage}
        placeholder="es o en"
      />

      <Button title="Guardar cambios" onPress={handleSave} />
      <Button title="Cerrar sesión" onPress={logout} color="#d9534f" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 30 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginTop: 5,
  },
});
