import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function InputGroup({ label, value, onChangeText, placeholder, error, ...rest }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontWeight: 'bold' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{
          borderWidth: 1, borderColor: error ? '#d32f2f' : '#ccc', borderRadius: 8,
          padding: 10, backgroundColor: '#fafafa'
        }}
        {...rest}
      />
      {error && <Text style={{ color: '#d32f2f', marginTop: 3 }}>{error}</Text>}
    </View>
  );
}
