import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import config from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${config.BASE_URL}/api/token/`, {
        email,
        password,
      });
  
      console.log('🔁 response.data:', response.data);
  
      const token = response.data.access;
      if (!token) {
        console.log('❌ Brak tokena w odpowiedzi!');
        return;
      }
  
      await AsyncStorage.setItem('access_token', token);
      console.log('✅ TOKEN zapisany:', token);
  
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Błąd logowania:', error);
      Alert.alert('Błąd logowania', 'Nieprawidłowy e-mail lub hasło');
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Logowanie</Text>
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
      />
      <Button title="Zaloguj" onPress={handleLogin} />
      <View style={{ marginTop: 20 }}>
        <Button title="Nie masz konta? Zarejestruj się" onPress={() => router.push('/register')} />
      </View>
    </View>
  );
}
