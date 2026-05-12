import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { supabase } from '../../lib/supabase/client';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      const redirectTo = makeRedirectUri({ scheme: 'justmove' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error ?? !data.url) throw error ?? new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (sessionError) throw sessionError;
      }
    } catch {
      Alert.alert('Sign in failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-cream px-8">
      <Text className="mb-2 text-4xl font-bold text-peach">justMove</Text>
      <Text className="mb-12 text-center text-base text-gray-500">
        Move a little. Your pet will love you for it.
      </Text>

      <TouchableOpacity
        onPress={signInWithGoogle}
        disabled={loading}
        className="w-full items-center rounded-2xl border border-gray-200 bg-white py-4 shadow-sm active:opacity-80"
      >
        {loading ? (
          <ActivityIndicator color="#FFBF9B" />
        ) : (
          <Text className="text-base font-medium text-gray-700">Continue with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
