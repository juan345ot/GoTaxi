import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import i18n from '../../translations';

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
    Alert.alert(i18n.t('profile_updated'), `${i18n.t('name')}: ${name}\n${i18n.t('language')}: ${language}`);
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

      <Button title={i18n.t('save')} onPress={handleSave} />
      <Button title={i18n.t('logout')} onPress={logout} color="#d9534f" />
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
