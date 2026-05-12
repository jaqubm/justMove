import { Text, TouchableOpacity, View } from 'react-native';

import { supabase } from '../../lib/supabase/client';
import { useSession } from '../../hooks/use-session';

export default function Home() {
  const { session } = useSession();

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <View className="flex-1 items-center justify-center bg-cream px-8">
      <Text className="mb-2 text-3xl font-bold text-peach">justMove</Text>
      <Text className="mb-12 text-base text-gray-500">{session?.user.email}</Text>

      <TouchableOpacity
        onPress={signOut}
        className="w-full items-center rounded-2xl bg-peach py-4 active:opacity-80"
      >
        <Text className="text-base font-semibold text-white">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
