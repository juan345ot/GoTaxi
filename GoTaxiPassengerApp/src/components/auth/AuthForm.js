import React from 'react';
import { View, StyleSheet } from 'react-native';
import InputField from '../common/InputField';
import PrimaryButton from '../common/PrimaryButton';

export default function AuthForm({
  email,
  password,
  confirmPassword,
  name,
  showName = false,
  showConfirm = false,
  onChangeEmail,
  onChangePassword,
  onChangeConfirmPassword,
  onChangeName,
  onSubmit,
  loading,
  buttonText,
}) {
  return (
    <View style={styles.container}>
      {showName && (
        <InputField
          label="Nombre"
          value={name}
          onChangeText={onChangeName}
          placeholder="Tu nombre"
          icon="person"
        />
      )}

      <InputField
        label="Correo"
        value={email}
        onChangeText={onChangeEmail}
        placeholder="ejemplo@correo.com"
        icon="mail"
        keyboardType="email-address"
      />

      <InputField
        label="Contraseña"
        value={password}
        onChangeText={onChangePassword}
        placeholder="******"
        secureTextEntry
        icon="lock-closed"
      />

      {showConfirm && (
        <InputField
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChangeText={onChangeConfirmPassword}
          placeholder="******"
          secureTextEntry
          icon="lock-closed"
        />
      )}

      <PrimaryButton title={buttonText} loading={loading} onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginVertical: 20,
  },
});
