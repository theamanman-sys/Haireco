import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function MarketplaceScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/marketplace/products')
      .then(({ data }) => setProducts(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="bag" size={32} color="#9ca3af" />
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.shop}>{item.shop?.shopName}</Text>
      <Text style={styles.price}>Br {item.price}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#800020" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Beauty Shop</Text>
      <FlatList data={products} renderItem={renderProduct} keyExtractor={(item) => item.id} numColumns={2} contentContainerStyle={{ padding: 16 }} columnWrapperStyle={{ gap: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 16, paddingBottom: 0 },
  card: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 12 },
  imagePlaceholder: { backgroundColor: '#f3f4f6', height: 100, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  shop: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  price: { fontSize: 16, fontWeight: '700', color: '#800020', marginTop: 4 },
});
