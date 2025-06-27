import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ProfileField from '../../components/common/ProfileField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('Juan');
  const [email, setEmail] = useState('juan@mail.com');

  const handleSave = () => {
    showToast('Perfil actualizado');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ProfileField label="Nombre" value={name} onChangeText={setName} />
      <ProfileField label="Correo" value={email} editable={false} />
      <PrimaryButton title="Guardar cambios" icon="save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
