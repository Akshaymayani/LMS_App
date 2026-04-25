import { AppButton } from '@/components/app/app-button';
import { AppInput } from '@/components/app/app-input';
import { AppText } from '@/components/app/app-text';
import { Radius, makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLoginMutation } from '@/hooks/useApi';
import { loginSchema, type LoginFormValues } from '@/utils/validation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { colors, scheme } = useAppTheme();
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroStack}>
            <LinearGradient
              colors={colors.heroGradient}
              locations={[0, 0.56, 1]}
              style={[styles.heroCard, makeShadow(colors.shadow, 18)]}
            >
              <View style={styles.heroEyebrow}>
                <MaterialIcons color="#FFFFFF" name="auto-awesome" size={18} />
                <AppText variant="eyebrow" tone="inverse">
                  Mini LMS Studio
                </AppText>
              </View>
              <AppText variant="display" tone="inverse">
                Learn in motion. Ship skills faster.
              </AppText>
              <AppText style={styles.heroBody} tone="inverse">
                React Query-backed learning paths, gesture-rich cards, offline bookmarks, and
                polished dark/light themes in one focused mobile stack.
              </AppText>
              <View style={styles.heroStatRow}>
                <MiniBadge label="Secure auth" value="JWT" />
                <MiniBadge label="Catalog" value="Infinite" />
                <MiniBadge label="Style" value={scheme} />
              </View>
            </LinearGradient>

            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                makeShadow(colors.shadow, 14),
              ]}
            >
              <View style={styles.formHeader}>
                <AppText variant="title">Welcome back</AppText>
                <AppText tone="muted">
                  Sign in to continue your saved courses, progress tracking, and profile sync.
                </AppText>
              </View>

              <View style={styles.formFields}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      label="Email"
                      onChangeText={onChange}
                      placeholder="Enter your email"
                      value={value}
                      error={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      autoCapitalize="none"
                      autoComplete="password"
                      label="Password"
                      onChangeText={onChange}
                      placeholder="Enter your password"
                      secureTextEntry
                      value={value}
                      error={errors.password?.message}
                    />
                  )}
                />
              </View>

              {loginMutation.error ? (
                <AppText tone="danger">{loginMutation.error.message}</AppText>
              ) : null}

              <AppButton
                accessibilityLabel="Sign in"
                disabled={loginMutation.isPending}
                onPress={onSubmit}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Enter the Studio'}
              </AppButton>

              <Link href="/auth/register" asChild>
                <Pressable accessible accessibilityLabel="Create an account" style={styles.switchLink}>
                  <AppText tone="muted">New here?</AppText>
                  <AppText tone="accent" variant="button">
                    Create an account
                  </AppText>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MiniBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.badge}>
      <AppText variant="caption" tone="inverse">
        {label}
      </AppText>
      <AppText variant="headline" tone="inverse">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heroStack: {
    gap: 20,
  },
  heroCard: {
    borderRadius: Radius.xl,
    gap: 16,
    overflow: 'hidden',
    padding: 24,
  },
  heroEyebrow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: Radius.pill,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBody: {
    maxWidth: 540,
  },
  heroStatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.lg,
    minWidth: 108,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  formCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 18,
    padding: 22,
  },
  formHeader: {
    gap: 8,
  },
  formFields: {
    gap: 16,
  },
  switchLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
