import { makeShadow, Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../app/app-text';

const EmptyCard = () => {
    const { colors } = useAppTheme();
    return (
        <View
            style={[
                styles.emptyState,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
                makeShadow(colors.shadow, 10),
            ]}
        >
            <MaterialIcons color={colors.accent} name="bookmark-border" size={30} />
            <AppText variant="headline">No saved courses yet</AppText>
            <AppText tone="muted" style={styles.centerText}>
                Bookmark any course from the catalog and its snapshot stays available here even when
                you are offline.
            </AppText>
        </View>
    )
}

export default EmptyCard

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        borderRadius: Radius.xl,
        borderWidth: 1,
        gap: 12,
        marginTop: 12,
        padding: 24,
    },
    centerText: {
        textAlign: 'center',
    },
})