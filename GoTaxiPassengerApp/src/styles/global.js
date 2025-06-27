import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#1E90FF',
  secondary: '#FFD700',
  text: '#333',
  background: '#FFF',
};

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
});
