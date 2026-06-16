import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const roles = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'SALON_OWNER', label: 'Salon Owner' },
  { value: 'SHOP', label: 'Shop Owner' },
];

export default function RegisterScreen() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      Alert.alert('Success', 'Account created!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.half]} placeholder="First Name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
          <TextInput style={[styles.input, styles.half]} placeholder="Last Name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
        </View>
        <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
        <Text style={styles.label}>I am a</Text>
        <View style={styles.roleRow}>
          {roles.map((r) => (
            <TouchableOpacity key={r.value} style={[styles.roleBtn, form.role === r.value && styles.roleBtnActive]} onPress={() => setForm({ ...form, role: r.value })}>
              <Text style={[styles.roleBtnText, form.role === r.value && styles.roleBtnTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  form: { backgroundColor: 'white', padding: 24, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#374151' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roleBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' },
  roleBtnActive: { borderColor: '#800020', backgroundColor: 'rgba(128,0,32,0.1)' },
  roleBtnText: { fontSize: 14, color: '#6b7280' },
  roleBtnTextActive: { color: '#800020', fontWeight: '600' },
  button: { backgroundColor: '#800020', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
