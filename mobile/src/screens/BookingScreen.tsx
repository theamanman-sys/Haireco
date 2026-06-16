import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function BookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { salonId } = route.params;

  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/salons/${salonId}/services`)
      .then(({ data }) => setServices(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [salonId]);

  const handleBook = async () => {
    if (!selectedService || !dateTime) {
      Alert.alert('Error', 'Select a service and date/time');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        salonId,
        serviceId: selectedService,
        startTime: new Date(dateTime).toISOString(),
      });
      Alert.alert('Success', 'Booking created! Pay deposit to confirm.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#800020" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      <Text style={styles.label}>Select Service</Text>
      {services.map((s) => (
        <TouchableOpacity key={s.id} style={[styles.serviceItem, selectedService === s.id && styles.serviceItemActive]} onPress={() => setSelectedService(s.id)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{s.name}</Text>
            <Text style={styles.serviceDuration}>{s.duration} min</Text>
          </View>
          <Text style={styles.servicePrice}>Br {s.price}</Text>
          {selectedService === s.id && <Ionicons name="checkmark-circle" size={20} color="#800020" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Date & Time</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD HH:MM" value={dateTime} onChangeText={setDateTime} />

      <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={submitting}>
        <Text style={styles.bookBtnText}>{submitting ? 'Booking...' : 'Confirm Booking (20% Deposit)'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 12 },
  serviceItem: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  serviceItemActive: { borderColor: '#800020', backgroundColor: 'rgba(128,0,32,0.1)' },
  serviceName: { fontSize: 16, fontWeight: '500' },
  serviceDuration: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  servicePrice: { fontSize: 16, fontWeight: '600', color: '#800020' },
  input: { backgroundColor: 'white', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#d1d5db' },
  bookBtn: { backgroundColor: '#800020', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  bookBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
