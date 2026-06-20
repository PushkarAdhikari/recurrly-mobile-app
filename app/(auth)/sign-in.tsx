import { useSignIn } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')

  const [showPassword, setShowPassword] = React.useState(false)
  const [emailError, setEmailError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')

  const validate = () => {
    let valid = true
    setEmailError('')
    setPasswordError('')

    if (!emailAddress.trim()) {
      setEmailError('Email is required')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      setEmailError('Enter a valid email address')
      valid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      valid = false
    }

    return valid
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          router.replace('/(tabs)' as Href)
        },
      })
    } else if (signIn.status === 'needs_second_factor') {
      console.error('Second factor (TOTP/backup code) not yet supported')
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      )

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode()
      }
    } else {
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  const handleVerify = async () => {
    const { error } = await signIn.mfa.verifyEmailCode({ code })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          router.replace('/(tabs)' as Href)
        },
      })
    } else {
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  return (
    <View className="auth-safe-area" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="auth-scroll"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">R</Text>
            </View>
            <View>
              <Text className="auth-wordmark">recurrly</Text>
              <Text className="auth-wordmark-sub">Subscription Manager</Text>
            </View>
          </View>
        </View>

        {signIn.status === 'needs_client_trust' ? (
          <>
            <Text className="auth-title" style={{ textAlign: 'center' }}>
              Verify your email
            </Text>
            <Text className="auth-subtitle" style={{ alignSelf: 'center' }}>
              Enter the verification code sent to your email
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${errors.fields.code ? 'auth-input-error' : ''}`}
                    value={code}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                  {errors.fields.code && (
                    <Text className="auth-error">{errors.fields.code.message}</Text>
                  )}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    (!code || fetchStatus === 'fetching') && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  className={`auth-button ${(!code || fetchStatus === 'fetching') ? 'auth-button-disabled' : ''}`}
                  onPress={handleVerify}
                  disabled={!code || fetchStatus === 'fetching'}
                >
                  <Text className="auth-button-text">Verify</Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.mfa.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.reset()}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text className="auth-title" style={{ textAlign: 'center' }}>
              Welcome back
            </Text>
            <Text className="auth-subtitle" style={{ alignSelf: 'center' }}>
              Sign in to manage your subscriptions
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={`auth-input ${emailError ? 'auth-input-error' : ''}`}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={emailAddress}
                    placeholder="you@example.com"
                    placeholderTextColor="#999"
                    onChangeText={(v) => { setEmailAddress(v); setEmailError('') }}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                  />
                  {emailError ? (
                    <Text className="auth-error">{emailError}</Text>
                  ) : errors.fields.identifier ? (
                    <Text className="auth-error">{errors.fields.identifier.message}</Text>
                  ) : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View>
                    <TextInput
                      className={`auth-input ${passwordError ? 'auth-input-error' : ''}`}
                      value={password}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      onChangeText={(v) => { setPassword(v); setPasswordError('') }}
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  </View>
                  {passwordError ? (
                    <Text className="auth-error">{passwordError}</Text>
                  ) : errors.fields.password ? (
                    <Text className="auth-error">{errors.fields.password.message}</Text>
                  ) : null}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  className={`auth-button ${(!emailAddress || !password || fetchStatus === 'fetching') ? 'auth-button-disabled' : ''}`}
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password || fetchStatus === 'fetching'}
                >
                  <Text className="auth-button-text">Continue</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        <View className="auth-link-row">
          <Text className="auth-link-copy">Don't have an account?</Text>
          <Link href="/(auth)/sign-up" className="auth-link">
            Sign up
          </Link>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {},
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {},
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 13,
    fontFamily: 'sans-semibold',
    color: '#ea7a53',
  },
})
