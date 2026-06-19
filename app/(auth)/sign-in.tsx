import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const SignIn = () => {
  return (
    <View>
      <Text>sign-in</Text>

      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white">
        Create Account
      </Link>
    </View>
  )
}

export default SignIn;