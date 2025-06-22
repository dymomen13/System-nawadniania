import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import config from '../constants/config';

export default function AddDevice() {
  const [deviceId, setDeviceId] = useState('');
  const [name, setName] = useState('');
  const [minWilgotnosc, setMinWilgotnosc] = useState('0');

  const handleAddDevice = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      await axios.post(
        `${config.BASE_URL}/api/dodaj_urzadzenie/`,
        {
          device_id: deviceId,
          name,
          min_wilgotnosc: parseFloat(minWilgotnosc),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Sukces', 'Urządzenie zostało przypisane');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Błąd przypisywania:', error);

      const msg =
        error.response?.data?.error || 'Nie udało się przypisać urządzenia';
      Alert.alert('Błąd', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>➕ Przypisz nowe urządzenie</Text>

      <Text>🆔 Device ID:</Text>
      <TextInput
        value={deviceId}
        onChangeText={setDeviceId}
        style={styles.input}
        placeholder="ESP32-001"
      />

      <Text>📛 Nazwa (opcjonalna):</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Doniczka balkon"
      />

      <Text>💧 Min. wilgotność (%):</Text>
      <TextInput
        value={minWilgotnosc}
        onChangeText={setMinWilgotnosc}
        keyboardType="numeric"
        style={styles.input}
        placeholder="0"
      />

      <Button title="Dodaj urządzenie" onPress={handleAddDevice} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
});
