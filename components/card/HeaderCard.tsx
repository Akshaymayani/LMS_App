import { makeShadow, Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../app/app-text';
import { SectionHeader } from '../app/section-header';


interface HeaderCardProps {
    cardSize: number;
}
const HeaderCard = ({cardSize}: HeaderCardProps) => {
    const { colors } = useAppTheme();
  return (
              <View style={styles.headerWrap}>
            <View
              style={[
                styles.hero,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                makeShadow(colors.shadow, 12),
              ]}
            >
              <View style={[styles.heroBadge, { backgroundColor: colors.surfaceRaised }]}>
                <MaterialIcons color={colors.accent} name="bookmark" size={18} />
                <AppText variant="eyebrow" tone="accent">
                  Offline Ready
                </AppText>
              </View>
              <AppText variant="title">Saved for your next focused session</AppText>
              <AppText tone="muted">
                These bookmarked courses are persisted locally with Redux Persist so the shortlist
                stays with you between app launches.
              </AppText>
            </View>
            <SectionHeader eyebrow="Bookmarks" title={`${cardSize} saved course${cardSize === 1 ? '' : 's'}`} />
          </View>
  )
}

export default HeaderCard

const styles = StyleSheet.create({
      headerWrap: {
    gap: 18,
    marginBottom: 20,
  },
  hero: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 14,
    padding: 22,
  },
  heroBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
})