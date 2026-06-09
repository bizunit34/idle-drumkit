import { useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { colors, radii, spacing } from '../theme';
import { clampSliderValue, positionToSliderValue } from '../utils/slider';

type Props = {
  value: number;
  onChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  label?: string;
};

export function VolumeSlider({
  value,
  onChange,
  onSlidingComplete,
  label = 'Master Volume',
}: Props) {
  const [width, setWidth] = useState(1);
  const [dragging, setDragging] = useState(false);
  const clampedValue = clampSliderValue(value);
  const percent = Math.round(clampedValue * 100);

  const updateFromX = (x: number, complete = false) => {
    const next = positionToSliderValue(x, width);
    onChange(next);
    if (complete) onSlidingComplete?.(next);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setDragging(true);
      updateFromX(event.nativeEvent.locationX);
    },
    onPanResponderMove: (event) => {
      updateFromX(event.nativeEvent.locationX);
    },
    onPanResponderRelease: (event) => {
      setDragging(false);
      updateFromX(event.nativeEvent.locationX, true);
    },
    onPanResponderTerminate: () => setDragging(false),
  });

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setWidth(Math.max(1, event.nativeEvent.layout.width));
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <Text style={styles.valueLabel}>{label}</Text>
        <Text style={styles.value}>{percent}%</Text>
      </View>
      <Pressable
        {...panResponder.panHandlers}
        onLayout={onTrackLayout}
        style={styles.track}
        accessibilityRole="adjustable"
      >
        <View style={[styles.fill, { width: `${percent}%` }]} />
        <View style={[styles.thumb, { left: `${percent}%` }]}>
          {dragging ? (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{percent}%</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>0%</Text>
        <Text style={styles.rangeText}>100%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  value: {
    color: colors.cyan,
    fontSize: 15,
    fontWeight: '900',
  },
  track: {
    height: 44,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  tooltip: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.black,
  },
  tooltipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: colors.mutedText,
    fontSize: 12,
  },
});
