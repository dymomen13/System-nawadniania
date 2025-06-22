import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import config from '../constants/config';

export default function DeviceHistory() {
  const { device_id } = useLocalSearchParams();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeasurements = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      const response = await axios.get(
        `${config.BASE_URL}/api/pomiary/${device_id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('📡 Pomiary:', response.data);
      setMeasurements(response.data.pomiary);
    } catch (error) {
      console.error('❌ Błąd podczas pobierania pomiarów:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Ładowanie archiwum...</Text>
      </View>
    );
  }

  if (measurements.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Brak pomiarów dla tego urządzenia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Archiwum pomiarów: {device_id}</Text>
      <FlatList
        data={measurements}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.date}>📅 {new Date(item.timestamp).toLocaleString()}</Text>
            <Text>🌡 Temp: {item.temperatura}°C</Text>
            <Text>💧 Wilg. powietrza: {item.wilgotnosc_powietrza}%</Text>
            <Text>🪴 Wilg. gleby: {item.wilgotnosc_gleby}%</Text>
            <Text>☀️ Nasłonecznienie: {item.naslonecznienie} %</Text>
            <Text>🚿 Podlane: {item.czy_podlewane ? 'Tak ✅' : 'Nie ❌'}</Text>
          </View>
        )}
      />
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
  item: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
  },
  date: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
