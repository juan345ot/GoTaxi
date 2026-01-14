import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import RatingStars from '../common/RatingStars';

export default function DriverInfoCard({ driver, vehicle, onPress }) {
  const { theme } = useTheme();
  
  const defaultColors = {
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#007AFF',
  };
  
  const safeTheme = theme?.colors ? theme : {
    isDarkMode: false,
    colors: { ...defaultColors },
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: safeTheme.colors.surface }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={driver?.avatar ? { uri: driver.avatar } : require('../../../assets/images/driver1.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: safeTheme.colors.primary }]}>{driver?.name}</Text>
        <RatingStars value={driver?.rating || 0} size={16} disabled />
        <Text style={[styles.vehicle, { color: safeTheme.colors.textSecondary }]}>{vehicle}</Text>
        {driver?.carImage && (
          <Image source={{ uri: driver.carImage }} style={styles.carImage} />
        )}
      </View>
      <View style={styles.chevron}>
        <Text style={[styles.chevronText, { color: safeTheme.colors.primary }]}>›</Text>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    padding: 9,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 1, height: 5 },
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 24,
    fontWeight: '300',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  name: {
    color: '#007aff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  vehicle: {
    color: '#555',
    fontSize: 13,
    marginTop: 1,
  },
  carImage: {
    width: 40,
    height: 30,
    borderRadius: 5,
    marginTop: 5,
  },
});
