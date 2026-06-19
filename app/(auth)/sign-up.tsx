import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const SignUp = () => {
  return (
    <View>
      <Text>sign-up</Text>

      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white">
        Already have an account? Sign In
      </Link>
    </View>
  )
}

export default SignUp;