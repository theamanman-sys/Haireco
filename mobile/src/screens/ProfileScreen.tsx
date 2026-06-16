import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function ProfileScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.serviceName}>{item.service?.name}</Text>
        <Text style={[styles.status, { color: item.status === 'COMPLETED' ? '#059669' : item.status === 'CONFIRMED' ? '#2563eb' : '#d97706' }]}>{item.status}</Text>
      </View>
      <Text style={styles.salonName}>{item.salon?.name}</Text>
      <Text style={styles.date}>{new Date(item.startTime).toLocaleString()}</Text>
      <Text style={styles.amount}>Br {item.totalAmount}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#800020" />;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#800020" />
        </View>
        <Text style={styles.name}>My Profile</Text>
      </View>
      <Text style={styles.sectionTitle}>My Bookings</Text>
      <FlatList data={bookings} renderItem={renderBooking} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  profileHeader: { alignItems: 'center', padding: 24, backgroundColor: 'white' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(128,0,32,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  name: { fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  serviceName: { fontSize: 16, fontWeight: '500' },
  status: { fontSize: 12, fontWeight: '600' },
  salonName: { fontSize: 13, color: '#6b7280' },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '700', color: '#800020', marginTop: 4 },
});
