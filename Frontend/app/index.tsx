import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>🌿 Witaj w RoślinkiApp!</Text>
      <Button title="Przejdź do logowania" onPress={() => router.push('/login')} />
    </View>
  );
}