import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const features = [
  { icon: 'calendar', title: 'Book Appointments', desc: 'Real-time booking with transparent pricing' },
  { icon: 'star', title: 'Verified Pros', desc: 'Portfolios, reviews & verification badges' },
  { icon: 'bag', title: 'Shop Products', desc: 'Cosmetics & hair products marketplace' },
  { icon: 'briefcase', title: 'Talent Hub', desc: 'Job board for beauty professionals' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>HairEco</Text>
        <Text style={styles.heroSubtitle}>Your Complete Beauty & Salon Ecosystem</Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Salons')}>
            <Text style={styles.primaryBtnText}>Find a Salon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.secondaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Everything You Need</Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Ionicons name={f.icon as any} size={28} color="#800020" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0d0b' },
  hero: { backgroundColor: '#1a1510', padding: 32, paddingTop: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.065)' },
  heroTitle: { fontSize: 36, fontWeight: 'bold', color: '#f0ebe3', fontFamily: 'Playfair Display' },
  heroSubtitle: { fontSize: 16, color: 'rgba(240,235,227,0.55)', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  heroButtons: { flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: '#800020', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 4 },
  primaryBtnText: { color: 'white', fontWeight: '600', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  secondaryBtn: { borderWidth: 1, borderColor: 'rgba(240,235,227,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 4 },
  secondaryBtnText: { color: 'rgba(240,235,227,0.7)', fontWeight: '600', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  featuresSection: { padding: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#f0ebe3', fontFamily: 'Playfair Display' },
  featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1510', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.065)' },
  featureText: { marginLeft: 16, flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#f0ebe3' },
  featureDesc: { fontSize: 13, color: 'rgba(240,235,227,0.55)', marginTop: 2 },
});
