import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs')
      .then(({ data }) => setJobs(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderJob = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.type}>{item.jobType?.replace('_', ' ')}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="business" size={14} color="#6b7280" />
        <Text style={styles.info}>{item.salon?.name}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location" size={14} color="#6b7280" />
        <Text style={styles.info}>{item.location}</Text>
      </View>
      {item.salaryRange && <Text style={styles.salary}>{item.salaryRange}</Text>}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#800020" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Talent Hub</Text>
      <FlatList data={jobs} renderItem={renderJob} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 16, paddingBottom: 0 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  type: { fontSize: 12, backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: '#6b7280' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  info: { fontSize: 14, color: '#6b7280' },
  salary: { fontSize: 14, fontWeight: '600', color: '#800020', marginTop: 8 },
});
