import { AppText } from '@/components/app/app-text';
import { makeShadow, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppDispatch } from '@/store/hooks';
import { showSnackbar } from '@/store/slices/uiSlice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { changeIcon, getIcon } from 'react-native-change-icon';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = 'Light' | 'Dark';

const ICON_OPTIONS: {
  icon: IconName;
  materialIcon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}[] = [
    {
      icon: 'Light',
      materialIcon: 'wb-sunny',
      title: 'Light icon',
      description: 'Bright launcher icon for a lighter home screen.',
    },
    {
      icon: 'Dark',
      materialIcon: 'dark-mode',
      title: 'Dark icon',
      description: 'Dark launcher icon for a quieter home screen.',
    },
  ];

export default function AppIconScreen() {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const [selectedIcon, setSelectedIcon] = useState<IconName>('Light');
  const [changingIcon, setChangingIcon] = useState<IconName | null>(null);


  useEffect(() => {
    (async () => {
      const icons = await getIcon();
      console.log('AVAILABLE ICON ', icons);
    })()
  }, [])

  useEffect(() => {
    let mounted = true;

    async function hydrateIcon() {
      try {
        const currentIcon = await getIcon();

        if (mounted && (currentIcon === 'Light' || currentIcon === 'Dark')) {
          setSelectedIcon(currentIcon);
        }
      } catch {
        // Native icon state is only available in installed native builds.
      }
    }

    hydrateIcon();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChangeIcon = async (icon: IconName) => {
    console.log("ICON NAME ", icon);

    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      dispatch(
        showSnackbar({
          message: 'App icon changes are available on native builds only.',
          tone: 'error',
        })
      );
      return;
    }

    setChangingIcon(icon);

    try {
      const response = await changeIcon(icon);
      console.log("ICON CHANGE RESPONSE ", response);
      setSelectedIcon(icon);
      dispatch(
        showSnackbar({
          message: `${icon} app icon selected.`,
          tone: 'success',
        })
      );
    } catch (error) {
      console.log("ICON CHANGE ERROR ", error);
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('ICON_ALREADY_USED')) {
        setSelectedIcon(icon);
        return;
      }

      dispatch(
        showSnackbar({
          message: 'Unable to change the app icon in this build.',
          tone: 'error',
        })
      );
    } finally {
      setChangingIcon(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            makeShadow(colors.shadow, 10),
          ]}
        >
          <View style={styles.headerRow}>
            <View style={[styles.iconShell, { backgroundColor: colors.surfaceRaised }]}>
              <MaterialIcons color={colors.accent} name="apps" size={22} />
            </View>
            <View style={styles.headerCopy}>
              <AppText variant="headline">Choose app icon</AppText>
              <AppText tone="muted">
                Select the launcher icon that should appear on the device.
              </AppText>
            </View>
          </View>

          {ICON_OPTIONS.map((option) => {
            const isSelected = selectedIcon === option.icon;
            const isChanging = changingIcon === option.icon;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, busy: isChanging }}
                key={option.icon}
                onPress={() => handleChangeIcon(option.icon)}
                style={({ pressed }) => [
                  styles.optionRow,
                  {
                    backgroundColor: isSelected ? colors.accentSoft : colors.surfaceMuted,
                    borderColor: isSelected ? colors.accent : colors.border,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.surface }]}>
                  <MaterialIcons
                    color={isSelected ? colors.accent : colors.textMuted}
                    name={option.materialIcon}
                    size={24}
                  />
                </View>
                <View style={styles.optionCopy}>
                  <AppText>{option.title}</AppText>
                  <AppText variant="caption" tone="muted">
                    {isChanging ? 'Changing icon...' : option.description}
                  </AppText>
                </View>
                {isSelected ? (
                  <MaterialIcons color={colors.accent} name="check-circle" size={24} />
                ) : (
                  <MaterialIcons color={colors.textMuted} name="radio-button-unchecked" size={24} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    gap: 18,
    padding: Spacing.lg,
    paddingBottom: 110,
  },
  panel: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 14,
  },
  iconShell: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  optionRow: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 76,
    padding: 14,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: Radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
});
