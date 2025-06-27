import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import i18n from '../../translations';
import Toast from 'react-native-root-toast';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(i18n.locale.slice(0, 2));

  useEffect(() => {
    if (language === 'es' || language === 'en') {
      i18n.locale = language;
    }
  }, [language]);

  const handleSave = () => {
    Toast.show(i18n.t('profile_updated'), {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('my_profile')}</Text>

      <Text style={styles.label}>{i18n.t('name')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>{i18n.t('email')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        editable={false}
      />

      <Text style={styles.label}>{i18n.t('language')}</Text>
      <TextInput
        style={styles.input}
        value={language}
        onChangeText={setLanguage}
        placeholder="es o en"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>{i18n.t('save')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>{i18n.t('logout')}</Text>
      </TouchableOpacity>
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
  saveButton: {
    marginTop: 20,
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
