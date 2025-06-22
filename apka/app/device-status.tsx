import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import config from '../constants/config';

export default function DeviceStatus() {
  const { device_id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      const response = await axios.get(
        `${config.BASE_URL}/api/pomiar/${device_id}/latest/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('📡 Ostatni pomiar:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('❌ Błąd podczas pobierania stanu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Ładowanie stanu...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text>Brak danych dla tego urządzenia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Ostatni pomiar: {data.name || device_id}</Text>

      <Text style={styles.item}>🌡 Temperatura: {data.temperatura}°C</Text>
      <Text style={styles.item}>💧 Wilgotność powietrza: {data.wilgotnosc_powietrza}%</Text>
      <Text style={styles.item}>🪴 Wilgotność gleby: {data.wilgotnosc_gleby}%</Text>
      <Text style={styles.item}>☀️ Nasłonecznienie: {data.naslonecznienie} %</Text>
      <Text style={styles.item}>
        🚿 Podlane: {data.czy_podlewane ? 'Tak ✅' : 'Nie ❌'}
      </Text>
      <Text style={styles.item}>⏰ Czas pomiaru: {new Date(data.czas).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
  },
});
