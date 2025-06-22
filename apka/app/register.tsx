import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import config from '../constants/config';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
        const response = await axios.post(`${config.BASE_URL}/api/register/`, {
        username,
        email,
        password,
      });

      Alert.alert('Sukces', 'Konto utworzone pomyślnie');
      router.replace('/login'); // przekierowanie do logowania
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Coś poszło nie tak';
      Alert.alert('Błąd rejestracji', errorMsg);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Rejestracja</Text>

      <TextInput
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Email"
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

      <Button title="Zarejestruj się" onPress={handleRegister} />
    </View>
  );
}
