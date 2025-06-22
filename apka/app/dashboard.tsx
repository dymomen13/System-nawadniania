import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import config from '../constants/config';

export default function Dashboard() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${config.BASE_URL}/api/moje_urzadzenia/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDevices(response.data.devices);
    } catch (error) {
      console.error('❌ Błąd przy pobieraniu urządzeń:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deviceId: string) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć to urządzenie?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('access_token');
              await axios.delete(`${config.BASE_URL}/api/usun_urzadzenie/${deviceId}/`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert('Sukces', 'Urządzenie zostało usunięte');
              fetchDevices();
            } catch (error) {
              console.error('❌ Błąd usuwania:', error);
              Alert.alert('Błąd', 'Nie udało się usunąć urządzenia');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Ładowanie urządzeń...</Text>
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ marginBottom: 20 }}>Nie masz jeszcze żadnych urządzeń</Text>
        <Button title="➕ Dodaj nowe urządzenie" onPress={() => router.push('/device-add')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>📟 Twoje urządzenia</Text>

        {devices.map((device) => (
          <View key={device.device_id} style={styles.deviceCard}>
            <Text style={styles.deviceId}>🆔 {device.device_id}</Text>
            <Text style={styles.text}>📛 Nazwa: {device.name || 'nazwa nieprzypisana'}</Text>
            <Text style={styles.text}>💧 Min. wilgotność: {device.min_wilgotnosc ?? 'brak'}%</Text>

            <Button
              title="Stan"
              onPress={() => router.push(`/device-status?device_id=${device.device_id}`)}
            />
            <View style={styles.spacer} />
            <Button
              title="Archiwum"
              onPress={() => router.push(`/device-history?device_id=${device.device_id}`)}
            />
            <View style={styles.spacer} />
            <Button
              title="Edytuj"
              onPress={() => router.push(`/device-edit?device_id=${device.device_id}`)}
            />
            <View style={styles.spacer} />
            <Button
              title="❌ Usuń"
              color="red"
              onPress={() => handleDelete(device.device_id)}
            />
          </View>
        ))}

        <View style={{ marginTop: 20 }}>
          <Button
            title="➕ Dodaj nowe urządzenie"
            onPress={() => router.push('/device-add')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  deviceCard: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  deviceId: {
    fontSize: 18,
    marginBottom: 5,
  },
  text: {
    marginBottom: 10,
  },
  spacer: {
    height: 10,
  },
});
