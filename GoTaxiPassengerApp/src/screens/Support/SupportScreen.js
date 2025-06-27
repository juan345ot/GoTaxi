import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import { showToast } from '../../utils/toast';

export default function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject || !message) {
      showToast('Completá todos los campos');
      return;
    }

    showToast('Mensaje enviado al soporte');
    setSubject('');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <InputField
        label="Asunto"
        value={subject}
        onChangeText={setSubject}
        placeholder="Ej: Problema con el viaje"
        icon="help-circle"
      />

      <InputField
        label="Mensaje"
        value={message}
        onChangeText={setMessage}
        placeholder="Escribí tu consulta"
        icon="chatbubble-ellipses"
      />

      <PrimaryButton title="Enviar" icon="send" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
});
