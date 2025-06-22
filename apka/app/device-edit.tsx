import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import config from '../constants/config';

export default function EditDevice() {
  const { device_id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [minWilgotnosc, setMinWilgotnosc] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDeviceSettings = async () => {
    try {
      const response = await axios.get(
        `${config.BASE_URL}/api/device/${device_id}/settings/`
      );

      setName(response.data.name || '');
      setMinWilgotnosc(String(response.data.min_wilgotnosc || ''));
    } catch (error) {
      console.error('❌ Błąd pobierania danych urządzenia:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać danych urządzenia');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      const parsedValue = parseFloat(minWilgotnosc);
      const rounded = Math.round(parsedValue * 100) / 100;

      await axios.put(
        `${config.BASE_URL}/api/update_device/`,
        {
          device_id,
          name,
          min_wilgotnosc: rounded,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Sukces', 'Urządzenie zaktualizowane');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Błąd zapisu:', error);
      const msg =
        error.response?.data?.error || 'Nie udało się zapisać zmian';
      Alert.alert('Błąd', msg);
    }
  };

  const handleWilgotnoscInput = (input: string) => {
    let cleaned = input.replace(',', '.');

    // usuń niedozwolone znaki
    cleaned = cleaned.replace(/[^0-9.]/g, '');

    const parts = cleaned.split('.');
    if (parts.length > 2) return;

    // ogranicz do 2 cyfr po przecinku
    if (parts[1]?.length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }

    const endsWithDot = cleaned.endsWith('.');
    const endsWithZero = cleaned.endsWith('0') && parts[1]?.length === 1;

    let numeric = parseFloat(parts.join('.'));
    if (!isNaN(numeric)) {
      if (numeric > 100) numeric = 100;
      if (numeric < 0) numeric = 0;

      let output = numeric.toString();

      if (endsWithDot && !output.includes('.')) {
        output += '.';
      }

      if (endsWithZero && !output.endsWith('0')) {
        output += '0';
      }

      setMinWilgotnosc(output);
    } else {
      setMinWilgotnosc(cleaned);
    }
  };

  useEffect(() => {
    fetchDeviceSettings();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Ładowanie danych urządzenia...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>✏️ Edytuj urządzenie</Text>

      <Text>📛 Nazwa:</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Nowa nazwa"
      />

      <Text>💧 Min. wilgotność (%):</Text>
      <TextInput
        value={minWilgotnosc}
        onChangeText={handleWilgotnoscInput}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholder="np. 30.5"
      />

      <Button title="Zapisz zmiany" onPress={handleUpdate} />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
