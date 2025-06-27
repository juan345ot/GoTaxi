import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ProfileField from '../../components/common/ProfileField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';
import { useLanguage } from '../../hooks/useLanguage';

export default function ProfileScreen({ navigation }) {
  const { language, changeLanguage } = useLanguage();
  const [name, setName] = useState('Juan');
  const [email] = useState('juan@mail.com');
  const [selectedLang, setSelectedLang] = useState(language);

  const handleSave = () => {
    changeLanguage(selectedLang);
    showToast('Perfil actualizado');
  };

  return (
    <View style={styles.container}>
      <ProfileField label="Nombre" value={name} onChangeText={setName} />
      <ProfileField label="Correo" value={email} editable={false} />
      <ProfileField
        label="Idioma"
        value={selectedLang}
        onChangeText={setSelectedLang}
      />
      <PrimaryButton title="Guardar Cambios" icon="save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
