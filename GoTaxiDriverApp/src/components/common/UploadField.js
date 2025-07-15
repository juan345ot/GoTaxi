import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function UploadField({ label, value, onChange }) {
  const handlePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity
        onPress={handlePick}
        style={{
          borderWidth: 1,
          borderColor: '#aaa',
          borderRadius: 8,
          padding: 10,
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}
      >
        {value ? (
          <Image source={{ uri: value }} style={{ width: 100, height: 80, borderRadius: 6 }} />
        ) : (
          <Text style={{ color: '#007aff' }}>Seleccionar archivo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
