import { memo, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const RatingStars = memo(function RatingStars({
  value = 0,
  max = 5,
  onChange,
  size = 32,
  disabled = false,
  editable = true,
}) {
  const handleStarPress = useCallback((starValue) => {
    if (!disabled && editable && onChange) {
      onChange(starValue);
    }
  }, [disabled, editable, onChange]);

  const stars = useMemo(() => {
    return Array.from({ length: max }, (_, idx) => {
      const starValue = idx + 1;
      const isFilled = idx < value;

      return (
        <TouchableOpacity
          key={idx}
          onPress={() => handleStarPress(starValue)}
          disabled={disabled || !editable}
          style={styles.starBtn}
        >
          <Ionicons
            name={isFilled ? 'star' : 'star-outline'}
            size={size}
            color={isFilled ? colors.accent : colors.border}
          />
        </TouchableOpacity>
      );
    });
  }, [max, value, size, disabled, editable, handleStarPress]);

  return (
    <View style={styles.row}>
      {stars}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  starBtn: {
    padding: 2,
  },
});

export default RatingStars;
