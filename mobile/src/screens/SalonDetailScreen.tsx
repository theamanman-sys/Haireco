import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function SalonDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/salons/${id}`)
      .then(({ data }) => setSalon(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#800020" />;
  if (!salon) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{salon.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.info}>{salon.address}, {salon.city}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.info}>{salon.averageRating?.toFixed(1)} ({salon.totalReviews} reviews)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Services</Text>
      {salon.services?.map((s: any) => (
        <TouchableOpacity key={s.id} style={styles.serviceCard}>
          <View>
            <Text style={styles.serviceName}>{s.name}</Text>
            <Text style={styles.serviceDuration}>{s.duration} min</Text>
          </View>
          <Text style={styles.servicePrice}>Br {s.price}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('BookAppointment', { salonId: id })}>
        <Text style={styles.bookBtnText}>Book Appointment (20% Deposit)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: 'white', padding: 16, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  info: { fontSize: 14, color: '#6b7280' },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8 },
  serviceCard: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, fontWeight: '500' },
  serviceDuration: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  servicePrice: { fontSize: 16, fontWeight: '600', color: '#800020' },
  bookBtn: { backgroundColor: '#800020', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  bookBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
