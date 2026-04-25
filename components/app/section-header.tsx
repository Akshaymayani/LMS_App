import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app/app-text';

export function SectionHeader({
  eyebrow,
  title,
  actionLabel,
  onPressAction,
}: {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? <AppText variant="eyebrow" tone="accent">{eyebrow}</AppText> : null}
        <AppText variant="title">{title}</AppText>
      </View>
      {actionLabel ? (
        <Pressable accessible accessibilityLabel={actionLabel} onPress={onPressAction}>
          <AppText variant="caption" tone="accent">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
});
