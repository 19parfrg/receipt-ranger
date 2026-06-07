import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconBackground}>
          <ShieldCheck size={48} color="#ffffff" />
        </View>
        <Text style={styles.title}>ReceiptRanger</Text>
        <Text style={styles.subtitle}>Privacy-First Expense Inbox</Text>
      </View>
      <ActivityIndicator size="small" color="#8b5cf6" style={styles.loader} />
      <Text style={styles.footer}>100% On-Device OCR</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconBackground: {
    padding: 16,
    backgroundColor: '#7c3aed',
    borderRadius: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '500',
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
