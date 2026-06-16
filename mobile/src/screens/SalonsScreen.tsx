import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function SalonsScreen() {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    api.get('/salons')
      .then(({ data }) => setSalons(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderSalon = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SalonDetail', { id: item.id })}>
      <View style={styles.cardHeader}>
        <Text style={styles.salonName}>{item.name}</Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={styles.ratingText}>{item.averageRating?.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Ionicons name="location" size={14} color="#6b7280" />
        <Text style={styles.infoText}>{item.city}, {item.address}</Text>
      </View>
      {item.services?.slice(0, 3).map((s: any) => (
        <Text key={s.id} style={styles.service}>{s.name} - Br {s.price}</Text>
      ))}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#800020" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find a Salon</Text>
      <FlatList data={salons} renderItem={renderSalon} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  salonName: { fontSize: 18, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '500', color: '#92400e' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  infoText: { fontSize: 13, color: '#6b7280' },
  service: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
});
