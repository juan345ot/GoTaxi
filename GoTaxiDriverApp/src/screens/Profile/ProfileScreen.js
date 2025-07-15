import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';

const MOCK_USER = {
  nombre: "Juan Scapellato",
  email: "conductor@gotaxi.com",
  foto: null, // Si tenés una URL, ponela acá
  documentos: [
    { nombre: "Foto del auto", status: "Aprobado", uri: null },
    { nombre: "Carnet de conducir", status: "Aprobado", uri: null },
    { nombre: "Seguro", status: "Pendiente", uri: null },
    { nombre: "VTV", status: "Aprobado", uri: null },
    { nombre: "Libre de multas", status: "Aprobado", uri: null },
    { nombre: "Certificado de antecedentes", status: "Pendiente", uri: null },
  ]
};

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER);

  const cerrarSesion = () => {
    Alert.alert("Cierre de sesión", "¡Hasta la próxima, conductor!");
    // Aquí más adelante iría el logout real
    // navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 30 }}>
      <View style={{
        alignItems: 'center',
        marginBottom: 22
      }}>
        <Image
          source={user.foto ? { uri: user.foto } : require('../../../assets/images/logo.png')}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: "#ffd600" }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{user.nombre}</Text>
        <Text style={{ color: '#007aff', fontSize: 15 }}>{user.email}</Text>
      </View>
      <View style={{ width: '100%' }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 17 }}>Documentación</Text>
        {user.documentos.map((doc, idx) => (
          <View key={idx} style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f7f7f7',
            padding: 12,
            borderRadius: 10,
            marginBottom: 8
          }}>
            <Text style={{ flex: 1 }}>{doc.nombre}</Text>
            <Text style={{
              color:
                doc.status === "Aprobado" ? "#10b981"
                : doc.status === "Pendiente" ? "#ff9800"
                : "#d32f2f",
              fontWeight: 'bold'
            }}>
              {doc.status}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={cerrarSesion}
        style={{ marginTop: 30, backgroundColor: '#ffd600', padding: 16, borderRadius: 10, width: '100%' }}
      >
        <Text style={{ color: '#222', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
