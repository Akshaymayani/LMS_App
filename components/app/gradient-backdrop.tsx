import { useAppTheme } from '@/hooks/use-app-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function GradientBackdrop() {
  const { colors, scheme } = useAppTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={colors.heroGradient} locations={[0, 0.56, 1]} style={styles.hero} />
      <View
        style={[
          styles.orb,
          styles.orbOne,
          {
            backgroundColor: scheme === 'dark' ? 'rgba(73, 177, 255, 0.12)' : 'rgba(11, 141, 255, 0.12)',
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbTwo,
          {
            backgroundColor: scheme === 'dark' ? 'rgba(242, 139, 75, 0.12)' : 'rgba(255, 122, 69, 0.12)',
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbThree,
          {
            backgroundColor: scheme === 'dark' ? 'rgba(53, 208, 151, 0.1)' : 'rgba(30, 174, 116, 0.1)',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 360,
    opacity: 0.18,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 240,
    height: 240,
    top: 120,
    right: -60,
  },
  orbTwo: {
    width: 180,
    height: 180,
    top: 320,
    left: -50,
  },
  orbThree: {
    width: 140,
    height: 140,
    bottom: 120,
    right: 20,
  },
});
