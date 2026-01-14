import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function AuthHeader({ eslogan = '¡Su taxi a un click de distancia!' }) {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.goBox}>
          <Text style={styles.goText}>Go</Text>
        </View>
        <View style={styles.taxiBox}>
          <Text style={styles.taxiText}>Taxi</Text>
        </View>
      </View>
      <Text style={[styles.slogan, { color: theme.colors.textSecondary }]}>{eslogan}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  goBox: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  goText: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 40,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taxiBox: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  taxiText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 40,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  slogan: {
    marginTop: 8,
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
