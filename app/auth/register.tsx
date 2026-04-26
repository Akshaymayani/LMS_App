import { AppButton } from '@/components/app/app-button';
import { AppInput } from '@/components/app/app-input';
import { AppText } from '@/components/app/app-text';
import { makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRegisterMutation } from '@/hooks/useApi';
import { registerPageStyles } from '@/styles/registerPageStyles';
import { registerSchema, type RegisterFormValues } from '@/utils/validation';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const registerMutation = useRegisterMutation();
  const styles = registerPageStyles();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    console.log("PAYLOAD",values);
    
    await registerMutation.mutateAsync(values);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={colors.heroGradient}
            locations={[0, 0.56, 1]}
            style={[styles.hero, makeShadow(colors.shadow, 18)]}
          >
            <View style={styles.heroLabel}>
              <MaterialIcons color="#FFFFFF" name="rocket-launch" size={18} />
              <AppText variant="eyebrow" tone="inverse">
                Build Your Learning Hub
              </AppText>
            </View>
            <AppText variant="display" tone="inverse">
              Create a profile that remembers every sprint.
            </AppText>
            <AppText tone="inverse">
              Register once and the app keeps your theme choices, bookmarked content, avatar, and
              course progress synced across sessions.
            </AppText>
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
              <AppText variant="title">Create your account</AppText>
            </View>

            <View style={styles.fieldGroup}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    autoCapitalize="words"
                    label="Full name"
                    onChangeText={onChange}
                    placeholder="Enter your full name"
                    value={value}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    autoCapitalize="none"
                    label="Username"
                    onChangeText={onChange}
                    placeholder="Enter your username"
                    value={value}
                    error={errors.username?.message}
                  />
                )}
              />

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
                    autoComplete="password-new"
                    label="Password"
                    onChangeText={onChange}
                    placeholder="Enter secure password"
                    secureTextEntry
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            {registerMutation.error ? (
              <AppText tone="danger">{registerMutation.error.message}</AppText>
            ) : null}

            <AppButton
              accessibilityLabel="Create account"
              disabled={registerMutation.isPending}
              onPress={onSubmit}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Launch My Dashboard'}
            </AppButton>

            <Link href="/auth/login" asChild>
              <Pressable accessible accessibilityLabel="Go to sign in" style={styles.switchLink}>
                <AppText tone="muted">Already have access?</AppText>
                <AppText tone="accent" variant="button">
                  Sign in
                </AppText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}