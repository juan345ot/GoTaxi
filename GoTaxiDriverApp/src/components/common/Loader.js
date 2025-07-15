import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Loader({ color = "#007aff", size = "large" }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={color} size={size} />
    </View>
  );
}
